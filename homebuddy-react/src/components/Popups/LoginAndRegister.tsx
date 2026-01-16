import React, { FC, useEffect, useState } from "react";
import FullScreenPopup from "./FullScreenPopup";
import LoginPopup from "./LoginPopup";
import SignupPopup from "./SignupPopup";

type Mode = "login" | "signup";

interface LoginAndRegisterProps {
    open: boolean;
    onClose: () => void;
    initialMode?: Mode;
}

const LoginAndRegister: FC<LoginAndRegisterProps> = ({
    open,
    onClose,
    initialMode = "login",
}) => {
    const [mode, setMode] = useState<Mode>(initialMode);

    useEffect(() => {
        if (open) {
            setMode(initialMode);
        }
    }, [open, initialMode]);

    function changeMode(newMode: Mode) {
        setMode(newMode);
    }

    return (
        <FullScreenPopup open={open} onClose={onClose}>
            {mode === "login" ? (
                <LoginPopup onSignupClick={() => changeMode("signup")} />
            ) : (
                <SignupPopup onLoginClick={() => changeMode("login")} />
            )}
        </FullScreenPopup>
    );
};

export default LoginAndRegister;