import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { Button } from '../../../ui/ui';

// Define a custom type that extends HTMLDialogElement with your methods

interface DialogRef {
    openDialog: () => void;
    closeDialog: () => void;
}

interface DialogPopUpProps {
    votedNo: boolean;
    handleSubmit: (text: string) => void
    handleResetVote: () => void
    initialText: string
    playButton: React.ReactNode
}


const dialogStyles: React.CSSProperties = {
    width: "30%",
    height: "40%",
    position: 'fixed',
    zIndex: '1',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: 'none',
    padding: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    minWidth: '300px',
};

const DialogPopUp = forwardRef<DialogRef, DialogPopUpProps>(({ handleResetVote, initialText, votedNo, handleSubmit, playButton }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [isError, setIsError] = useState(false);
    const [textValue, setTextValue] = useState(initialText);
    let value = textValue || initialText

    useEffect(() => {
        setTextValue(initialText);
    }, [initialText]);

    useEffect(() => {
        if (votedNo) dialogRef.current?.showModal();
    }, [votedNo])

    const handleTextChange = (text: string) => setTextValue(text)

    useImperativeHandle(ref, () => ({
        openDialog: () => {
            dialogRef.current?.showModal();
        },
        closeDialog: () => {
            dialogRef.current?.close();
            setIsError(false)
        },
        // Spread the original HTMLDialogElement methods
        ...dialogRef.current
    }));

    return (
        <dialog ref={dialogRef} style={dialogStyles}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: "100%", gap: '2rem', padding: '20px' }}>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <h2 style={{ display: 'block', marginBottom: '0px', fontSize: '1.8rem', color: '#141414' }}>Enter New Transcription:</h2>
                    {/* {playButton} */}
                </div>

                <div style={{ height: '100%', width: '100%' }}>
                    <ErrorDialog
                        isOpen={isError}
                        onClose={() => setIsError(false)}
                        message="Cannot enter the same transcription"
                    />
                    <textarea
                        value={textValue}
                        onChange={e => {
                            handleTextChange(e.target.value);
                        }}
                        style={{ width: '100%', height: '100%', fontSize: '1.5rem', padding: '8px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)' }}
                    />
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'end', gap: '1rem' }}>
                    <Button rounded outline onClick={() => {
                        dialogRef.current?.close();
                        setTextValue(initialText);
                        handleResetVote();
                        setIsError(false)
                    }} style={{ marginTop: '10px', width: '20%' }}>Cancel</Button>
                    <Button rounded outline onClick={() => {
                        if (initialText == value) {
                            setIsError(true)
                            return
                        }
                        handleSubmit(textValue);
                        handleResetVote();
                        dialogRef.current?.close()
                        setIsError(false)
                    }} style={{ marginTop: '10px', width: '30%' }}>Submit</Button>
                </div>
            </div>

        </dialog>
    );
});








interface ErrorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ isOpen, onClose, message }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen && dialogRef.current) {
            dialogRef.current.showModal();
        } else if (dialogRef.current) {
            dialogRef.current.close();
        }
    }, [isOpen]);

    return (
        <dialog
            ref={dialogRef}
            style={{
                width: '300px',
                padding: '20px',
                borderRadius: '10px',
                border: 'none',
                zIndex: '2',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                textAlign: 'center',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                height: '180px'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25%', justifyContent: 'center', height: '100%' }}>
                {/* X Symbol to Close */}
                {/* <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '-15px',
                        left: '0px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                    }}
                >
                    &times;
                </button> */}
                <h3>{message}</h3>
                <Button
                    onClick={onClose}
                    style={{
                        width: '60px',
                        height: '50px',
                        borderRadius: "20px"
                    }}
                > OK</Button>
            </div>

            {/* <button
                onClick={onClose}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                    backgroundColor: '#f0f0f0',
                }}
            >
                OK
            </button> */}
        </dialog >
    );
};

export default DialogPopUp;
