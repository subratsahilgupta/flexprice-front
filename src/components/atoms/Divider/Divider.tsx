import { FC } from 'react';

interface DividerProps {
    color?: string;
    width?: string;
    alignment?: 'left' | 'center' | 'right';
}

const Divider: FC<DividerProps> = ({ color = '#E4E4E7', width = '100%', alignment = 'center' }) => {
    const alignmentClass =
        alignment === 'left'
            ? 'justify-start'
            : alignment === 'right'
                ? 'justify-end'
                : 'justify-center';

    return (
        <div className={`flex ${alignmentClass}`}>
            <div
                className="h-px"
                style={{
                    backgroundColor: color,
                    width: width,
                }}
            ></div>
        </div>
    );
};

export default Divider;
