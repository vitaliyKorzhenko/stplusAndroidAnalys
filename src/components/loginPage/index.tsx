import React from 'react';
import { Label, Input, makeStyles, shorthands, tokens, useId, Image, Button, Divider } from '@fluentui/react-components';
import { Mail24Filled, Password24Filled } from "@fluentui/react-icons";
import { auth, fetchSignInMethodsForEmailForUser, googleLogin } from '../../firebase';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';  // Используем правильную иконку Google

const useStyles = makeStyles({
    start: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",  // Вертикальное центрирование
        height: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "10px",
    },
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",  // Горизонтальное центрирование
        ...shorthands.gap("20px"),
        maxWidth: "400px",
        width: '100%',
        '> div': {
            display: "flex",
            flexDirection: "column",
            ...shorthands.gap("2px"),
        },
        '@media (max-width: 768px)': {
            maxWidth: '100%',
            padding: '20px',
        }
    },
    inputField: {
        width: '100%',
    },
    buttonField: {
        width: '100%',
    }
});

const inputStyle = {
    width: '100%',
    height: '50px',
    color: '#000',
    border: '1px solid #ced4da',
    '&:focus': {
        border: '1px solid #1E90FF',
    },
    '::placeholder': {
        color: '#ced4da',
    }
};

const buttonStyle = {
    width: '100%',
    height: '50px',
    backgroundColor: '#1074a1',
    color: 'white',
    fontSize: '15px',
    fontWeight: 'bold',
    border: '1px solid #1E90FF',
};

const buttonGoogleStyle = {
    width: '100%',
    height: '50px',
    backgroundColor: 'white',
    color: '#757575',
    fontSize: '15px',
    fontWeight: 'bold',
    border: '1px solid #1E90FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
        backgroundColor: '#f5f5f5',
    }
};

interface LoginProps {
    changeAuth: () => void;
}

export const Login = (props: LoginProps) => {
    const styles = useStyles();
    const beforeId = useId("content-before");
    const emailId = useId("email");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const signInOrSignUpWithEmailPassword = async () => {
        try {
            console.log('email', email);
            console.log('password', password);
    
            // Пытаемся войти
            await signInWithEmailAndPassword(auth, email, password);
            props.changeAuth();
        } catch (error: any) {
            console.error('Error during sign-in:', error.message || error);
    
            // Если ошибка "email-already-in-use", создаем нового пользователя
            if (error.code === 'auth/user-not-found') {
                try {
                    // Регистрируем нового пользователя
                    await createUserWithEmailAndPassword(auth, email, password);
                    // Сразу же выполняем вход
                    await signInWithEmailAndPassword(auth, email, password);
                    props.changeAuth();
                } catch (registerError: any) {
                    console.error('Error during registration:', registerError.message || registerError);
                }
            }
        }
    };
    
    

    const loginWithGoogleOld = async () => {
        try {
            const popupOptions = "width=500,height=600,scrollbars=yes";
            const googlePopup = window.open('', 'GoogleLogin', popupOptions);
            const res: any = await googleLogin();
            googlePopup?.close();
            props.changeAuth();
            return res.user;
        } catch (error) {
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            console.log('Start Google login');
            const user = await googleLogin(); // Вызов функции для аутентификации
            console.log('Google login success', user);
            props.changeAuth(); // Обновляем состояние аутентификации
        } catch (error) {
            console.error("Login error: ", error);
            throw error;
        }
    };

    return (
        <div className={styles.start}>
            <div className={styles.root}>
            <Image
    alt="Login"
    src="/statplus.png"
    style={{ maxWidth: '400px', maxHeight: '100px' }}
  />
                <div>
                    <Label size="large" htmlFor={beforeId} style={{ fontSize: '25px', color: '#23272b' }}>
                        Sign in with StatPlus account
                    </Label>
                </div>
                <div className={styles.inputField}>
                    <Input size="medium" contentBefore={<Mail24Filled />} id={emailId} type='email' placeholder='Email Address'
                        onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div className={styles.inputField}>
                    <Input size="medium" contentBefore={<Password24Filled />} id={beforeId} type='password'
                        placeholder='Password' onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                </div>
                <div className={styles.buttonField}>
                    <Button appearance="primary" size="large" style={buttonStyle} onClick={signInOrSignUpWithEmailPassword}>
                        Sign in
                    </Button>
                </div>
                {/* <div style={{ padding: '5px' }}>
                    <Divider style={{ margin: '5px 0', color: '#23272b' }}>OR</Divider>
                </div> */}
                <div className={styles.buttonField}>
                    <Button
                        size="large"
                        appearance="outline"
                        style={buttonGoogleStyle}
                        icon={<FcGoogle />}  // Правильная иконка Google
                        iconPosition="before"
                        onClick={loginWithGoogle}
                    >
                        Continue with Google
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Login;
