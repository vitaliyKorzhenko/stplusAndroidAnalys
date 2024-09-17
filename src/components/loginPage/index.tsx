import React from 'react';
import { Label, Input, makeStyles, shorthands, tokens, useId, Image, Button, Divider } from '@fluentui/react-components';
import { Mail24Filled, Password24Filled, GiftOpen24Filled } from "@fluentui/react-icons";
import { auth, googleLogin } from '../../firebase';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'firebase/auth';

const useStyles = makeStyles({
    start: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "10px",
    },
    root: {
        display: "flex",
        flexDirection: "column",
        ...shorthands.gap("20px"),
        maxWidth: "400px",
        "> div": {
            display: "flex",
            flexDirection: "column",
            ...shorthands.gap("2px"),
        },
        '@media (max-width: 768px)': {
            maxWidth: '100%',
            padding: '20px',
        }
    },
    main: {
        display: "grid",
        justifyContent: "flex-start",
        gridRowGap: tokens.spacingVerticalXXL,
    },
    field: {
        display: "grid",
        gridRowGap: tokens.spacingVerticalS,
    },
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
    color: '#23272b',
    fontSize: '15px',
    fontWeight: 'bold',
    border: '1px solid #1E90FF',
    '&:hover': {
        backgroundColor: '#23272b',
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
    
            // Получаем методы входа для email
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            
            // Если методы входа для email найдены, пытаемся войти
            if (signInMethods.length > 0) {
                if (!signInMethods.includes('password')) {
                    throw new Error('Invalid sign-in method. Please use another method like Google.');
                } else {
                    await signInWithEmailAndPassword(auth, email, password);
                    props.changeAuth();
                }
            } else {
                // Если email не зарегистрирован, создаем пользователя
                await createUserWithEmailAndPassword(auth, email, password);
                await signInWithEmailAndPassword(auth, email, password);
                props.changeAuth();
            }
        } catch (error: any) {
            console.error('Error', error.message || error);
        }
    };
    

    const loginWithGoogle = async () => {
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

    return (
        <div className={styles.start}>
            <div>
                <Image
                    alt="Login"
                    src="/statplus.png"
                    style={{ width: '100%', height: 'auto', maxWidth: '400px' }}
                />
            </div>
            <div className={styles.root}>
                <div>
                    <Label size="large" htmlFor={beforeId} style={{ fontSize: '25px', color: '#23272b' }}>
                        Sign in with StatPlus.io account
                    </Label>
                </div>
                <div>
                    <Input size="medium" contentBefore={<Mail24Filled />} id={emailId} type='email' placeholder='Email'
                        onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <Input size="medium" contentBefore={<Password24Filled />} id={beforeId} type='password'
                        placeholder='Password' onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                </div>
                <div>
                    <Button appearance="primary" size="large" style={buttonStyle} onClick={signInOrSignUpWithEmailPassword}>
                        Sign in
                    </Button>
                </div>
                <div style={{ padding: '5x' }}>
    <Divider style={{ margin: '5px 0', color: '#23272b' }}>OR</Divider>
</div>
<div style={{ padding: '5px', display: 'flex', justifyContent: 'center' }}>
    <Button
        size="large"
        appearance="outline"
        style={{ ...buttonGoogleStyle, width: '100%' }}  // ширина кнопки 100% для адаптивности
        icon={<GiftOpen24Filled />}
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
