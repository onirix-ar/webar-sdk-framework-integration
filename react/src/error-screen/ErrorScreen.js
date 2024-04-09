import React from 'react';

import './ErrorScreen.css';

export function ErrorScreen({error}) {
    const {title, message} = React.useMemo(() => ERROR_TITLES_AND_MESSAGES[error?.name], [error]);

    return (
        <div className="error-screen">
            <span className="error-screen__title">{title}</span>
            <span className="error-screen__message">{message}</span>
        </div>
    )
}

const ERROR_TITLES_AND_MESSAGES = {
    'INTERNAL_ERROR': {
        title: 'Internal Error',
        message: 'An unespecified error has occurred. Your device might not be compatible with this experience.'
    },
    'CAMERA_ERROR': {
        title: 'Camera Error',
        message: 'Could not access to your device\'s camera. Please, ensure you have given required permissions from your browser settings.',
    },
    'SENSORS_ERROR': {
        title: 'Sensors Error',
        message: 'Could not access to your device\'s motion sensors. Please, ensure you have given required permissions from your browser settings.',
    },
    'LICENSE_ERROR': {
        title: 'License Error',
        message: 'This experience does not exist or has been unpublished.',
    }
}
