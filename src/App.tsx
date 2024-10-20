import './App.css'
import { useEffect, useState } from 'react'
import { FluentProvider, webLightTheme, webDarkTheme} from '@fluentui/react-components'
import Login from './components/loginPage/index'
import { Drive } from './components/drive/index'
import { auth } from './firebase/index'
import { AppConfiguration } from './config/index'
import { ApiUserNode } from './api/ApiUser/index'
import { LocalStorageHelper } from './helpers/localstorageHelper'
import { UserProfile } from './users/index'
import { ProgressBarProvider } from './components/progressBar/progressContext'
import { MainSpread } from './components/spread/index'
import { activateLanguage } from './localization/localization'
import { getRedirectResult } from 'firebase/auth'
import LocalFileHelper from './helpers/localFileHelper'

function App() {


  const [theme, setTheme] = useState(webDarkTheme);

  const [driveMode, setDriveMode] = useState(true);

  const [isAuth, setIsAuth] = useState(false);
  
  let loclastrgLanguage = LocalStorageHelper.getCurrentLanguage() ? LocalStorageHelper.getCurrentLanguage() : 'en';

  const [currentLanguage, setCurrentLanguage] = useState(loclastrgLanguage);

  const [fileName, setFileName] = useState('Test FileName');

  const setFileNameHandler = (name: string) => {
    setFileName(name);
  }

  const changeAuth = () => {
    setIsAuth(!isAuth);
  }

  const changeDriveMode = () => {
    console.log('changeDriveMode');
    setDriveMode(!driveMode);
  }

  const updateLanguage = (langCode: string) => {
    console.log('updateLanguage', langCode);

    //set code to local storage
    LocalStorageHelper.setCurrentLanguage(langCode);
    activateLanguage(langCode);
    setCurrentLanguage(langCode);
  }
  // Функция для изменения темы
  const toggleTheme = () => {
    // Переключайте между темами при каждом вызове
    //randomTheme();
    //setTheme((prevTheme) => (prevTheme === teamsDarkTheme ? teamsLightTheme : teamsDarkTheme));
    setTheme(theme === webDarkTheme ? webLightTheme : webDarkTheme);

  };

  useEffect(() => {
    // init config
    AppConfiguration.initConfig(false);
    
    activateLanguage(currentLanguage ? currentLanguage : 'en');

    // Проверка результата редиректа
    const handleRedirectResult = async () => {
        try {
            const result = await getRedirectResult(auth);
            console.log('Redirect result:', result);
            if (result) {
                const user = result.user;
                console.log('User after redirect:', user);
                const email = user.email ? user.email : '';
                // Обработка успешной аутентификации
                ApiUserNode.loginWithEmailNode(email).then((res) => {
                    console.log('res', res);
                    if (!res) {
                        console.log('User not found');
                    }
                    LocalStorageHelper.setUserId(res.toString());
                    UserProfile.setCurrentUserId(res.toString());
                }).catch((error) => {
                    console.log('error', error);
                });
                setIsAuth(true);
            }
        } catch (error) {
            console.error("Redirect error: ", error);
        }
    };

    handleRedirectResult(); // Проверка редиректа при монтировании

    // Listen for changes in the authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log("Auth state changed", user);
        if (user) {
            console.log('user', user);
            const email = user.email ? user.email : '';
            // Обработка, если пользователь вошел через почту и пароль или редирект
            ApiUserNode.loginWithEmailNode(email).then((res) => {
                console.log('res', res);
                if (!res) {
                    console.log('User not found');
                }
                LocalStorageHelper.setUserId(res.toString());
                UserProfile.setCurrentUserId(res.toString());
            }).catch((error) => {
                console.log('error', error);
            });
            setIsAuth(true);
        } else {
            // User is signed out
            setIsAuth(false);
        }
    });

    //init file system
    try {
      console.log("Try to init file system");
      LocalFileHelper.initFileSystem();
      //create test file
      LocalFileHelper.createTestFile();
      //list files
      let names:string[] = LocalFileHelper.listFiles();
      //alert
      alert('Files found: ' + names);
    } catch (error) {
      console.log('Local FILE SYSTEM', error);
      
    }

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
}, []);



  if (!isAuth) {
  return (
    <FluentProvider>
    <Login
    changeAuth={changeAuth}
    />
    </FluentProvider>
  )
  } else {
    if (driveMode) {
     return (
      <FluentProvider theme={theme} style={{
        width: '100%',
        height: '100%'
      }}>
      <ProgressBarProvider>
      <Drive
      changeAuth={changeAuth}
      changeDriveMode={changeDriveMode}
      changeTheme={toggleTheme}
      updateLanguage={updateLanguage}
      setFileNameHandler={setFileNameHandler}

      />
      </ProgressBarProvider>
      </FluentProvider>
     )
    } else {
      return (
      <FluentProvider theme={theme}>
        <MainSpread
        changeAuth={changeAuth}
        changeDriveMode={changeDriveMode}
        changeTheme={toggleTheme}
        fileId={2}
        fileName={fileName}
        src='files'
        updateLanguage={updateLanguage}
        />
      </FluentProvider>
      )
    }
  }
}

export default App
