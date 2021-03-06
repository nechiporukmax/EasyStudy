import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  getRegisterPageRoute,
  getCreateGroupRoute,
} from "../../../routes/routes";
import { useHistory } from "react-router";
import { loginByJWT } from "../../../services/jwtService";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Rating } from "primereact/rating";
import { Toolbar } from "primereact/toolbar";
import { InputTextarea } from "primereact/inputtextarea";
import { RadioButton } from "primereact/radiobutton";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import {
  getGroupsAsync,
  createGroup,
  deleteGroup,
  deleteSelectedGroups,
  updateGroupAsync,
  getGroupsBySchoolAsync,
} from "../../../services/groupService";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { TabView, TabPanel } from "primereact/tabview";
import TeacherCreateGroupDataTable from "../../../components/table/TeacherCreateGroupDataTable";
import StudentsCreateGroupDataTable from "../../../components/table/StudentsCreateGroupDataTable";
import "react-pro-sidebar/dist/css/styles.css";
import { getStudentsByGroupIdAsync } from "../../../services/studentsService";
import { getTeacherByGroup } from "../../../services/teacherService";
import "./Group.css";
import ImageFieldGroupCropper from "../../../components//inputs/ImageFieldGroupCropper/ImageFieldGroupCropper";
import classNames from "classnames";

const GroupPage = () => {
  let emptyGroup = {
    id: null,
    name: "",
    teacher: "",
    teacherId: "",
  };
  const history = useHistory();
  const [photo, setPhoto] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState(null);
  const [inProgress, setInProgress] = useState(true);
  const [globalFilter, setGlobalFilter] = useState(null);
  const toast = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [deleteGroupDialog, setDeleteGroupDialog] = useState(false);
  const [deleteGroupsDialog, setDeleteGroupsDialog] = useState(false);
  const [group, setGroup] = useState(emptyGroup);
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState();
  const [errors, setErrors] = useState({});
  const [editDialog, setGroupEditDialog] = useState(false);
  const [studentsDialog, setStudentsDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState();

  const dt = useRef(null);

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || "";
    let _group = { ...group };
    _group[`${name}`] = val;

    setGroup(_group);
  };

  const { t } = useTranslation();

  useEffect(() => {
    console.log("getGroups");
    getGroups();
  }, []);
  const getCroppedImage = (img) => {
    console.log("photo=>", !!errors["photo"]);

    if (!!errors["photo"]) {
      let error = Object.assign({}, errors);
      delete error["photo"];
      console.log("photo=>", img);
      setPhoto(img);
      setErrors(error);
    } else {
      setPhoto(img);
    }
  };
  const getGroups = async () => {
    const response = await getGroupsBySchoolAsync(); //ToDo Id
    console.log("response=>", response);
    setGroups(response.data);
  };

  const header = (
    <div className="table-header">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          type="search"
          onInput={(e) => setGlobalFilter(e.target.value)}
          placeholder={t("Common.Search")}
        />
      </span>
    </div>
  );

  const openNew = () => {
    let r = Math.random().toString(36).substring(7);
    console.log("random", r);
    emptyGroup.name = r;
    setGroup(emptyGroup);
    setSubmitted(false);

    setCreateDialog(true);
  };

  const leftToolbarTemplate = (
    <React.Fragment>
      <Button
        icon="pi pi-plus"
        className="p-button-success p-mr-2"
        onClick={openNew}
      />
    </React.Fragment>
  );

  const rightToolbarTemplate = (
    <React.Fragment>
      <Button
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => confirmDeleteSelected()}
        disabled={!selectedGroups || !selectedGroups.length}
      />
    </React.Fragment>
  );
  const confirmDeleteGroup = (group) => {
    console.log("group=>", group);
    setGroup(group);
    setDeleteGroupDialog(true);
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-mr-2"
          onClick={() => editGroup(rowData)}
        />
        <Button
          style={{ marginLeft: "0.5vw" }}
          icon="pi pi-trash"
          className="p-button-rounded p-button-warning"
          onClick={() => confirmDeleteGroup(rowData)}
        />
      </React.Fragment>
    );
  };
  const updateGroup = async () => {
    setSubmitted(true);

    if (group.name.trim() && selectedTeacher) {
      let listOfStudents = [];
      if (selectedStudents)
        selectedStudents.map((item) => {
          listOfStudents.push(item.id);
        });
      let model = {
        Id: group.id,
        Name: group.name,
        TeacherId: selectedTeacher.id,
        StudentsId: listOfStudents,
      };
      await updateGroupAsync(model)
        .then(
          async (response) => {
            console.log(response);
            setCreateDialog(false);
            getGroups();
            toast.current.show({
              severity: "success",
              summary: "Successful",
              detail: t("Common.Created"),
              life: 3000,
            });
            setGroup(emptyGroup);
            setSelectedTeacher(null);
            setSelectedStudents(null);
            setGroupEditDialog(false);
          },
          (err) => {
            //setErrors(err.response.data);
            console.log("Error:", err.response.data);
          }
        )
        .catch((err) => {
          console.log("Global Server problen in controler message", err);
        });
    }
  };
  const saveGroup = async () => {
    setSubmitted(true);

    if (group.name.trim() && selectedTeacher) {
      console.log("listOfStudents=>", listOfStudents);
      let listOfStudents = [];
      if (selectedStudents)
        selectedStudents.map((item) => {
          listOfStudents.push(item.id);
        });
      console.log("listOfStudents=>", listOfStudents);

      let model = {
        Name: group.name,
        TeacherId: selectedTeacher.id,
        StudentsId: listOfStudents,
      };
      await createGroup(model)
        .then(
          async (response) => {
            console.log(response);
            setCreateDialog(false);
            getGroups();
            toast.current.show({
              severity: "success",
              summary: "Successful",
              detail: "Group Created",
              life: 3000,
            });
            setGroup(emptyGroup);
            setSelectedTeacher(null);
            setSelectedStudents(null);
            setCreateDialog(false);
          },
          (err) => {
            //setErrors(err.response.data);
            console.log("Error:", err.response.data);
          }
        )
        .catch((err) => {
          console.log("Global Server problen in controler message", err);
        });
    }
  };

  const groupsDialogFooter = (
    <React.Fragment>
      <Button
        label={t("Common.Cancel")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => hideDialog()}
      />
      <Button
        label={t("Common.Save")}
        icon="pi pi-check"
        className="p-button-text"
        onClick={saveGroup}
      />
    </React.Fragment>
  );
  const updateGroupsDialogFooter = (
    <React.Fragment>
      <Button
        label={t("Common.Cancel")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => {
          setGroupEditDialog(false);
        }}
      />
      <Button
        label={t("Common.Save")}
        icon="pi pi-check"
        className="p-button-text"
        onClick={updateGroup}
      />
    </React.Fragment>
  );

  const selectStudentDialogFooter = (
    <React.Fragment>
      <Button
        label={t("Common.Cancel")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => {
          setSelectedStudents(null);
          setStudentsDialog(false);
        }}
      />
      <Button
        label={t("Common.Save")}
        icon="pi pi-check"
        className="p-button-text"
        onClick={() => {
          setStudentsDialog(false);
        }}
      />
    </React.Fragment>
  );
  const deleteSelected = async () => {
    let selectedId = [];
    selectedGroups.forEach((element) => {
      selectedId.push(element.id);
    });
    await deleteSelectedGroups(selectedId)
      .then(
        async (response) => {
          console.log(response);
          getGroups();

          setDeleteGroupsDialog(false);
          setSelectedGroups(null);
          toast.current.show({
            severity: "success",
            summary: "Successful",
            detail: "Products Deleted",
            life: 3000,
          });

          setGroup(emptyGroup);
        },
        (err) => {
          //setErrors(err.response.data);
          console.log("Error:", err.response);
        }
      )
      .catch((err) => {
        console.log("Global Server problen in controler message", err);
      });
  };

  const editGroup = async (group) => {
    setGroup({ ...group });
    console.log("group=>", group);
    await getTeacherByGroup(group.id)
      .then(
        async (response) => {
          console.log("getTeacherByGroup=>", response);
          setSelectedTeacher(response.data);
          setGroupEditDialog(false);
        },
        (err) => {
          //setErrors(err.response.data);
          console.log("Error:", err.response);
        }
      )
      .catch((err) => {
        console.log("Global Server problen in controler message", err);
      });
    await getStudentsByGroupIdAsync(group.id)
      .then(
        async (response) => {
          console.log("getStudentsByGroupIdAsync=>", response);
          setSelectedStudents(response.data);
        },
        (err) => {
          //setErrors(err.response.data);
          console.log("Error:", err.response);
        }
      )
      .catch((err) => {
        console.log("Global Server problen in controler message", err);
      });
    setGroupEditDialog(true);
  };

  const deleteGroupsDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => hideDeleteGroupsDialog()}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteSelected}
      />
    </React.Fragment>
  );
  const hideDeleteGroupsDialog = () => {
    setDeleteGroupsDialog(false);
  };
  const confirmDeleteSelected = () => {
    console.log("confirmDeleteSelected");
    setDeleteGroupsDialog(true);
  };
  const deleteGroupHandler = async () => {
    await deleteGroup(group.id)
      .then(
        async (response) => {
          console.log(response);
          setDeleteGroupDialog(false);
          getGroups();

          toast.current.show({
            severity: "success",
            summary: "Successful",
            detail: "Group Deleted",
            life: 3000,
          });

          setGroup(emptyGroup);
        },
        (err) => {
          //setErrors(err.response.data);
          console.log("Error:", err.response);
        }
      )
      .catch((err) => {
        console.log("Global Server problen in controler message", err);
      });
  };
  const deleteGroupDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => hideDeleteGroupDialog()}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteGroupHandler}
      />
    </React.Fragment>
  );

  const hideDeleteGroupDialog = () => {
    setDeleteGroupDialog(false);
  };
  const hideDialog = () => {
    setSubmitted(false);
    setCreateDialog(false);
  };

  const getTeachersWitoutGroup = async () => {
    return;
  };

  return (
    <>
      {" "}
      <div className="main-page datatable-crud-demo">
        <div className="container card">
          <Toast ref={toast} />
          <Toolbar
            className="p-mb-4"
            left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          ></Toolbar>
          <DataTable
            ref={dt}
            value={groups}
            selection={selectedGroups}
            onSelectionChange={(e) => setSelectedGroups(e.value)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            header={header}
            className="p-component"
            globalFilter={globalFilter}
            scrollable
            scrollHeight="60vh"
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "3rem" }}
            ></Column>
            <Column
              field="id"
              header="id"
              sortable
              style={{ display: "none" }}
            ></Column>
            <Column field="name" header={t("Common.Title")} sortable></Column>
            <Column
              field="teacherName"
              header={t("Common.Teacher")}
              sortable
            ></Column>
            <Column
              field="quantityOfStudents"
              header={t("Common.QuantityOfStudents")}
              sortable
            ></Column>
            <Column body={actionBodyTemplate}></Column>
          </DataTable>
          <Dialog
            visible={deleteGroupDialog}
            style={{ width: "450px" }}
            header="Confirm"
            modal
            footer={deleteGroupDialogFooter}
            onHide={hideDeleteGroupDialog}
          >
            <div className="confirmation-content">
              <i
                className="pi pi-exclamation-triangle p-mr-3"
                style={{ fontSize: "2rem" }}
              />
              {group && (
                <span>
                  Are you sure you want to delete <b>{group.name}</b>?
                </span>
              )}
            </div>
          </Dialog>
          <Dialog
            visible={createDialog}
            style={{ width: "80vw", height: "90vh" }}
            header="Group Details"
            modal
            className="p-fluid"
            footer={groupsDialogFooter}
            onHide={hideDialog}
          >
            <div className="p-field">
              <label htmlFor="name">{t("Common.Name")}</label>
              <InputText
                id="name"
                value={group.name}
                onChange={(e) => onInputChange(e, "name")}
                required
                autoFocus
                className={classNames({
                  "p-invalid": submitted && !group.name,
                })}
              />
              {submitted && !group.name && (
                <small className="p-error">
                  {t("Common.Name")} {t("Common.required")}
                </small>
              )}
              <br />
              <Toolbar
                className="p-mb-4"
                right={() => {
                  return (
                    <Button
                      label={t("Common.AddStudent")}
                      icon="pi pi-plus"
                      className="p-button-success p-mr-2"
                      // onClick={() => history.push(getCreateGroupRoute())}
                      onClick={() => {
                        setStudentsDialog(true);
                      }}
                    ></Button>
                  );
                }}
              ></Toolbar>
              <label htmlFor="teacher">{t("Common.Teacher")}</label>
              <br />

              {submitted && !selectedTeacher && (
                <small className="p-error">
                  {t("Common.Teacher")} {t("Common.required")}
                </small>
              )}

              <TeacherCreateGroupDataTable
                selection={selectedTeacher}
                setSelected={setSelectedTeacher}
              />
            </div>
          </Dialog>
          <Dialog
            visible={studentsDialog}
            style={{ width: "80vw", height: "90vh" }}
            header={t("Common.StudentsDetails")}
            modal
            className="p-fluid"
            footer={selectStudentDialogFooter}
            onHide={() => {
              setStudentsDialog(false);
            }}
          >
            <div className="p-field">
              <StudentsCreateGroupDataTable
                selection={selectedStudents}
                idEdit={editDialog}
                setSelected={setSelectedStudents}
              />
            </div>
          </Dialog>
          <Dialog
            visible={editDialog}
            style={{ width: "80vw", height: "90vh" }}
            header={t("Common.EditGroups")}
            modal
            className="p-fluid"
            footer={updateGroupsDialogFooter}
            onHide={() => {
              setGroupEditDialog(false);
            }}
          >
            <div className="p-field">
              <label htmlFor="name">{t("Common.Title")}</label>
              <InputText
                id="name"
                value={group.name}
                onChange={(e) => onInputChange(e, "name")}
                required
                autoFocus
                className={classNames({
                  "p-invalid": submitted && !group.name,
                })}
              />
              {submitted && !group.name && (
                <small className="p-error">
                  {t("Common.Title")} {t("Common.required")}
                </small>
              )}

              <br />
              <Toolbar
                className="p-mb-4"
                right={() => {
                  return (
                    <Button
                      label={t("Common.AddStudent")}
                      icon="pi pi-plus"
                      className="p-button-success p-mr-2"
                      onClick={() => {
                        setStudentsDialog(true);
                      }}
                    ></Button>
                  );
                }}
              ></Toolbar>
              <label htmlFor="teacher">{t("Common.Teacher")}</label>
              <br />

              {submitted && !selectedTeacher && (
                <small className="p-error">
                  {t("Common.Teacher")} {t("Common.required")}
                </small>
              )}
              <TeacherCreateGroupDataTable
                idEdit={editDialog}
                selection={selectedTeacher}
                setSelected={setSelectedTeacher}
              />
            </div>
          </Dialog>

          <Dialog
            visible={deleteGroupsDialog}
            style={{ width: "35vw" }}
            header="Confirm"
            modal
            footer={deleteGroupsDialogFooter}
            onHide={hideDeleteGroupsDialog}
          >
            <div className="confirmation-content">
              <i
                className="pi pi-exclamation-triangle p-mr-3"
                style={{ fontSize: "2rem" }}
              />
              {group && <span>{t("Common.DeleteGroupConfirm")}</span>}
            </div>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default GroupPage;
