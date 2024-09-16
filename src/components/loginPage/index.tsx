import React from 'react';
import {Label, Input, makeStyles, shorthands, tokens, useId, Image, Button, Divider } from '@fluentui/react-components';



import { Mail24Filled, Password24Filled, GiftOpen24Filled  } from "@fluentui/react-icons";
import { auth, googleLogin} from '../../firebase';
import {createUserWithEmailAndPassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'firebase/auth';

const useStyles = makeStyles({
    start: {
        width: "100%",
        display: "flex",
        justifyContent: "center", // Центрируем контент по горизонтали
        // alignItems: "center", // Выравниваем контент по вертикали
        height: "100vh",
        backgroundColor: "#white",
    },
    root: {
        display: "flex",
        flexDirection: "column",
        ...shorthands.gap("20px"),
        // Prevent the example from taking the full width of the page (optional)
        maxWidth: "400px",
        // Stack the label above the field (with 2px gap per the design system)
        "> div": {
            display: "flex",
            flexDirection: "column",
            ...shorthands.gap("2px"),
        },
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

const childDiveStyle = {
    padding: '10px',
}

const inputStyle = {
    width: '400px',
    height: '50px',
    color: '#000', // Черный цвет текста
    border: '1px solid #ced4da',
    '&:focus': {
        border: '1px solid #red', // Синий цвет рамки при фокусе
    },
    '::placeholder': {
        color: '#ced4da', // Цвет текста placeholder
    }
};

const buttonStyle = {
    width: '400px',
    height: '50px',
    backgroundColor: '#1074a1',
    color: 'white',
    fotSize: '15px',
    fontWeight: 'bold',
    border: '1px solid #1E90FF',

}

const buttonGoogleStyle = {
    width: '400px',
    height: '50px',
    // backgroundColor: '#23272b',
    color: '#23272b',
    //size for text
    fontSize: '15px',
    //solid for text
    fontWeight: 'bold',
    border: '1px solid #1E90FF',
    '&:hover': {
        backgroundColor: '#23272b',
    }
}

interface LoginProps {
    changeAuth: () => void;
}

export const Login = (props : LoginProps) => {
    const styles = useStyles();
    const beforeId = useId("content-before");
    const emailId = useId("email");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

  

    const signInOrSignUpWithEmailPassword = async () => {
        try {
            console.debug('signInOrSignUpWithEmailPassword', email, password);
            //Check login methods for email
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            console.debug('signInMethods', signInMethods);
            if (signInMethods && signInMethods.length > 0 && !signInMethods.includes('password')) {
                // If the user has several sign-in methods,
                throw new Error('Invalid sign-in method for email and password' + ' You can use ' + signInMethods[0] + ' to sign in.');
            } else {
                console.debug('try signInWithEmailAndPassword')
                await signInWithEmailAndPassword(auth, email, password);
                props.changeAuth();
            }
        } catch (error: any) {
            console.debug('error', error);
            if (error && error.code === 'auth/user-not-found'||
                error && error.code === 'auth/invalid-credential' 
            ) {
                try {
                    // Если пользователя с таким email не существует, попытаемся создать нового пользователя
                    await createUserWithEmailAndPassword(auth, email, password);
                    await signInWithEmailAndPassword(auth, email, password);
                    props.changeAuth();
                } catch (createError) {
                   console.debug('createError', createError);
                }
            } else if (error.code === 'auth/wrong-password') {
                console.error('Invalid password');
            } else {
                console.error('Error', error);
            }
        }
    }

    const loginWithGoogle = async () => {
        try {
            console.debug('loginWithGoogle');
              const res: any = await googleLogin();
              console.debug('loginWithGoogle', res);
              props.changeAuth();
              return res.user;
            } catch (error) {
              throw error;
        }
    }

    return (
        <div className={styles.start}>
            <div
            >
                {/* Ваша картинка здесь */}
                <Image
                    alt="Login"
                    src="/statplus.png"
                    style={{
                        width: '400px',
                        height: '400px',
                    }}
                 
                />
            </div>
            <div >
                <div style={childDiveStyle}>
                    <Label size="large"
                        htmlFor={beforeId}
                        color='#23272b'
                        style={{
                            fontSize: '25px',

                            color: '#23272b'
                        }}
                    >
                        Sign in with StatPlus.io account
                    </Label>
                </div>
                <div style={childDiveStyle}>


                    <Input size="medium"
                        contentBefore={<Mail24Filled />}
                        id={emailId}
                        type='email'
                        placeholder='Email'
                        onChange={(e) => setEmail(e.target.value)}
                        style={
                            inputStyle
                        }
                    />
                </div>
                <div style={childDiveStyle}>
                    <Input size="medium"
                        contentBefore={<Password24Filled />}
                        id={beforeId}
                        type='password'
                        placeholder='Password'
                        onChange={(e) => setPassword(e.target.value)}
                        style={
                            inputStyle
                        }
                    />
                </div>
                <div style={childDiveStyle}>
                    <Button
                        appearance="primary"
                        size="large"
                        style={buttonStyle}
                        onClick={signInOrSignUpWithEmailPassword}
                    >
                        Sign in
                    </Button>
                </div>
                <div style={childDiveStyle}>
                    <Divider
                    style={{
                        color: '#23272b',
                    }}
                    >OR</Divider>
                </div>
                <div style={childDiveStyle}>
                    <Button
                        size="large"
                        appearance='outline'
                        style={buttonGoogleStyle}
                        icon={<GiftOpen24Filled />}
                        iconPosition='before'
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
