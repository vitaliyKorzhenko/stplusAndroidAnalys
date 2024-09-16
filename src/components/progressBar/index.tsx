import * as React from "react";
import { Field, ProgressBar } from "@fluentui/react-components";
import { useProgressBar } from "./progressContext";


export const Progress = () => {
    const { isVisible, progress } = useProgressBar();

    // Логирование изменений isVisible и progress
    console.log("isVisible:", isVisible);
    console.log("progress:", progress);

    // Логирование обновления компонента
    React.useEffect(() => {
        console.log("Progress component updated");
        console.log('isVisible', isVisible);
        console.log('progress', progress);
    }, [isVisible, progress]);

    return (
        <div style={{
          position: 'fixed', // фиксированное позиционирование
          top: 0, 
          left: 0,
          width: '100%', 
          height: '100%',
          zIndex: 1000, 
          pointerEvents: isVisible ? 'auto' : 'none', 
          display: isVisible ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
           {isVisible && (
                <Field
                    validationMessage={`Loading... ${progress}%`}
                    validationState="none" 
                    color="error"
                >
                    <div style={{
                        width: '100%', // ширина прогресс бара
                        margin: '0 auto', // центрирование по горизонтали
                    }}>
                        <ProgressBar  
                            color="error" // яркий цвет, например, красный
                        />
                    </div>
                </Field>
            )}
        </div>
    );
};
