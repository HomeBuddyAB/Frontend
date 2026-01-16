// ============================================
// File: components/admin/FormWrapper.tsx
// ============================================
import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface FormWrapperProps {
    title: string;
    onClose: () => void;
    onSave: () => void;
    children: ReactNode;
    isEdit?: boolean;
}

export function FormWrapper({ title, onClose, onSave, children, isEdit = false }: FormWrapperProps) {
    return (
        <div className="bg-[#2a2a2a] rounded-xl shadow-2xl border border-[#3a3a3a] w-full h-full flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[#3a3a3a]">
                <h3 className="text-xl font-bold text-white">
                    {isEdit ? `Edit ${title}` : `Add New ${title}`}
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {children}
            </div>

            <div className="flex gap-3 p-6 border-t border-[#3a3a3a]">
                <button
                    onClick={onClose}
                    type="button"
                    className="flex-1 px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg transition"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    type="button"
                    className="flex-1 px-4 py-2 bg-[#4a3a3a] hover:bg-[#5a4a4a] text-white rounded-lg transition font-medium"
                >
                    Save
                </button>
            </div>
        </div>
    );
}

interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    value?: any;
    onChange?: (value: any) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: { value: any; label: string }[];
    rows?: number;
    hideEmptyOption?: boolean;
}

export function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    options,
    rows,
    hideEmptyOption = false,
}: FormFieldProps) {
    const inputClasses = "w-full px-4 py-2 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5a4a4a] transition disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {type === 'select' && options ? (
                <select
                    name={name}
                    value={value ?? ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={inputClasses}
                    disabled={disabled}
                    required={required}
                >
                    {!hideEmptyOption && <option value="">Select {label}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    name={name}
                    value={value || ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    className={inputClasses}
                    disabled={disabled}
                    required={required}
                    rows={rows || 3}
                />
            ) : type === 'checkbox' ? (
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name={name}
                        checked={value || false}
                        onChange={(e) => onChange?.(e.target.checked)}
                        className="w-4 h-4 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-[#4a3a3a] focus:ring-2 focus:ring-[#5a4a4a]"
                        disabled={disabled}
                    />
                    <span className="text-sm text-gray-300">{placeholder}</span>
                </label>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={(e) => onChange?.(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    placeholder={placeholder}
                    className={inputClasses}
                    disabled={disabled}
                    required={required}
                />
            )}
        </div>
    );
}