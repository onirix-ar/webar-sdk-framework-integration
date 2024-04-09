import './LoadingScreen.css';

export function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-screen__bounce loading-screen__bounce--1"></div>
            <div className="loading-screen__bounce loading-screen__bounce--2"></div>
            <div className="loading-screen__bounce loading-screen__bounce--3"></div>
        </div>
    )
}
