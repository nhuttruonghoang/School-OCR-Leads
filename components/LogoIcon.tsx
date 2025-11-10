
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        {...props}
    >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.59V13H7.41c-.88 0-1.33-1.07-.71-1.71L11.29 6.7c.39-.39 1.02-.39 1.41 0l4.59 4.59c.62.62.17 1.71-.71 1.71H13v4.59c0 .55-.45 1-1 1z" />
        <path d="M3.51 9.51L9 15v-4.5H4.51c-.53 0-.82-.64-.42-1.04zM15 10.51V15l5.49-5.49c.4-.4-.08-1.04-.42-1.04H15z" opacity=".3" />
    </svg>
);
