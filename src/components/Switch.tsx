interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string; // e.g. "group-switch" or "item-switch"
}

export default function Switch({ checked, onChange, disabled, className = '' }: SwitchProps) {
    return (
        <label 
            className={`switch ${className}`} 
            onClick={(e) => e.stopPropagation()}
        >
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                disabled={disabled} 
            />
            <span className="slider"></span>
        </label>
    );
}
