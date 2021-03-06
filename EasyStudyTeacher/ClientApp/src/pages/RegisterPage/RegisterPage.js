import React, { useState, useEffect } from "react";
import TextField from "../../components/inputs/TextFieldGroup/TextFieldGroup";
import PhoneField from "../../components/inputs/PhoneFieldGroup/PhoneFieldGroup";
import { useTranslation } from "react-i18next";

import { register, login } from "../../services/authService";
import { validateRegisterFields } from "../../common/validateRegister";
import { validateLoginFields } from "../../common/validateLogin";
import { useHistory } from "react-router";
import { loginByJWT } from "../../services/jwtService";
import styles from "./RegisterPage.module.css";
import { getHomeRoute } from "../../routes/routes";
import { ImageFieldGroupCropper } from "../../components/inputs/ImageFieldGroupCropper/ImageFieldGroupCropper";
import "cropperjs/dist/cropper.css";
const RegisterPage = () => {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("");
  const [school, setSchool] = useState("");
  const [isRegister, setIsRegister] = useState(true);
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState("");
  const history = useHistory();
  const { t } = useTranslation();

  useEffect(() => {
    setLastName("");
    setFirstName("");
    setPassword("");
    setMiddleName("");
    setEmail("");
    setRegion("");
    setSchool("");
    setErrors("");
  }, [isRegister]);

  const registerHandler = async () => {
    if (isRegister) {
      let errors = validateRegisterFields({
        email,
        lastName,
        firstName,
        middleName,
        password,
        school,
        region,
        photo,
      });
      const isValid = Object.keys(errors).length === 0;
      if (isValid) {
        let model = {
          FirstName: firstName,
          MiddleName: middleName,
          LastName: lastName,
          Email: email,
          Password: password,
          Region: region,
          School: school,
          Photo: photo,
        };
        console.log("model", model);
        await register(model)
          .then(
            (response) => {
              console.log(response);
              setErrors("");
              loginByJWT(response.data);
              history.push(getHomeRoute());
            },
            (err) => {
              setErrors(err.response.data);
              console.log("Error:", err.response.data);
            }
          )
          .catch((err) => {
            console.log("Global Server problen in controler message", err);
          });
      } else {
        setErrors(errors);
      }
    } else {
      setIsRegister(true);
    }
  };

  const loginHandler = async () => {
    if (!isRegister) {
      let errors = validateLoginFields({
        email,
        password,
      });
      const isValid = Object.keys(errors).length === 0;
      if (isValid) {
        let model = {
          Email: email,
          Password: password,
        };
        await login(model)
          .then(
            (response) => {
              setErrors("");
              loginByJWT(response.data);
              history.push(getHomeRoute());
            },
            (err) => {
              setErrors(err.response.data);
            }
          )
          .catch((err) => {
            console.log("Global Server problen in controler message", err);
          });
      } else {
        setErrors(errors);
      }
    } else {
      setIsRegister(false);
    }
  };

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

  const renderLayout = () => {
    if (isRegister) {
      return (
        <div className={styles["register-page"]}>
          <div className={styles["thumbnail"]}>
            <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/169963/hat.svg" />
          </div>
          <div className={styles["main"]}>
            <TextField
              field="email"
              label="Електронна пошта"
              value={email}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              type="password"
              field="email"
              label="Пароль"
              value={password}
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Фото</label>
            <ImageFieldGroupCropper
              getCroppedImage={getCroppedImage}
              error={errors.photo}
              photo={photo}
            />
            <TextField
              field="lastName"
              label="Прізвище"
              value={lastName}
              error={errors.lastName}
              onChange={(e) => setLastName(e.target.value)}
            ></TextField>
            <TextField
              field="firstName"
              label={t("Common.Name")}
              value={firstName}
              error={errors.firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              field="middleName"
              label="По батькові"
              value={middleName}
              error={errors.middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />{" "}
            <TextField
              field="middleName"
              label="Область"
              value={region}
              error={errors.region}
              onChange={(e) => setRegion(e.target.value)}
            />{" "}
            <TextField
              field="middleName"
              label="Школа"
              value={school}
              error={errors.school}
              onChange={(e) => setSchool(e.target.value)}
            />
            <button onClick={registerHandler} className="btn btn-primary">
              <a className="text-white" to="/register">
                Створити обліковий запис
              </a>
            </button>
            <hr />
            <button onClick={loginHandler} className="btn btn-primary">
              Увійти
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles["register-page"]}>
          <div className={styles["thumbnail"]}>
            <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/169963/hat.svg" />
          </div>
          <div className={styles["main"]}>
            <TextField
              field="email"
              label="Електронна пошта"
              value={email}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              type="password"
              field="email"
              label="Пароль"
              value={password}
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={registerHandler} className="btn btn-primary">
              <a className="text-white" to="/register">
                Створити обліковий запис
              </a>
            </button>
            <hr />
            <button onClick={loginHandler} className="btn btn-primary">
              Увійти
            </button>
          </div>
        </div>
      );
    }
  };

  return <>{renderLayout()}</>;
};

export default RegisterPage;
