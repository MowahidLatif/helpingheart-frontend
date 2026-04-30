import type {
  ChangeEvent,
  ChangeEventHandler,
  CSSProperties,
  FocusEventHandler,
  HTMLAttributes,
  HTMLInputTypeAttribute,
  KeyboardEventHandler,
  ReactNode,
} from "react";

type InputValueType =
  | "string"
  | "number"
  | "email"
  | "password"
  | "color"
  | "file"
  | "checkbox"
  | "date"
  | "datetime-local"
  | "tel"
  | "url"
  | "search";

type InputPayload = string | number | boolean | File | File[] | null;
type GenericSetValue = { bivarianceHack(value: InputPayload): void }["bivarianceHack"];

type Props = {
  labelTitle?: ReactNode;
  value?: string | number | boolean;
  setValue?: GenericSetValue;
  valueType?: InputValueType;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  autoFocus?: boolean;
  required?: boolean;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  readOnly?: boolean;
  name?: string;
  accept?: string;
  multiple?: boolean;
  helperText?: ReactNode;
  errorText?: ReactNode;
  hideLabel?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  transformValue?: (raw: string, event: ChangeEvent<HTMLInputElement>) => InputPayload;
  wrapperStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  inputStyle?: CSSProperties;
};

function toInputType(valueType: InputValueType): HTMLInputTypeAttribute {
  if (valueType === "string") return "text";
  return valueType;
}

export default function GenericTextInput({
  labelTitle,
  value,
  setValue,
  valueType = "string",
  placeholder,
  disabled = false,
  id,
  className,
  wrapperClassName,
  labelClassName,
  inputClassName,
  min,
  max,
  step,
  onKeyDown,
  onBlur,
  autoFocus,
  required = false,
  inputMode,
  maxLength,
  minLength,
  autoComplete,
  readOnly,
  name,
  accept,
  multiple,
  helperText,
  errorText,
  hideLabel = false,
  onChange,
  transformValue,
  wrapperStyle,
  labelStyle,
  inputStyle,
}: Props) {
  const generatedId =
    id ??
    (typeof labelTitle === "string" && labelTitle.length
      ? `${labelTitle.replace(/\s+/g, "-").toLowerCase()}-generic-input`
      : typeof name === "string" && name.length
        ? `${name.replace(/\s+/g, "-").toLowerCase()}-generic-input`
        : undefined);
  const inputType = toInputType(valueType);
  const useFormInputClass =
    inputType !== "checkbox" && inputType !== "file" && inputType !== "color";
  const hasError = Boolean(errorText);
  const resolvedInputClassName = [
    useFormInputClass ? "form-input" : "",
    hasError ? "error" : "",
    inputClassName,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const helperId = helperText && generatedId ? `${generatedId}-help` : undefined;
  const errorId = errorText && generatedId ? `${generatedId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
    if (!setValue) return;

    if (transformValue) {
      setValue(transformValue(event.target.value, event));
      return;
    }

    if (inputType === "checkbox") {
      setValue(event.target.checked);
      return;
    }

    if (inputType === "file") {
      if (multiple) {
        setValue(event.target.files ? Array.from(event.target.files) : []);
      } else {
        setValue(event.target.files?.[0] ?? null);
      }
      return;
    }

    setValue(event.target.value);
  };

  const wrapperClasses = ["form-group", wrapperClassName].filter(Boolean).join(" ");
  const rowClasses = ["generic-input-row", hideLabel ? "is-label-hidden" : ""]
    .filter(Boolean)
    .join(" ");
  const labelClasses = ["form-label", required ? "required" : "", labelClassName]
    .filter(Boolean)
    .join(" ");

  const isCheckbox = inputType === "checkbox";
  const inputValue = isCheckbox || inputType === "file" ? undefined : (value as string | number | undefined);

  return (
    <div className={wrapperClasses} style={wrapperStyle}>
      <div className={rowClasses}>
        {!hideLabel && labelTitle ? (
          <label className={labelClasses} htmlFor={generatedId} style={labelStyle}>
            {labelTitle}
          </label>
        ) : null}

        <div className="generic-input-control">
          <input
            id={generatedId}
            name={name}
            type={inputType}
            className={resolvedInputClassName}
            value={inputValue}
            checked={isCheckbox ? Boolean(value) : undefined}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            autoFocus={autoFocus}
            required={required}
            inputMode={inputMode}
            maxLength={maxLength}
            minLength={minLength}
            autoComplete={autoComplete}
            readOnly={readOnly}
            accept={accept}
            multiple={multiple}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            style={inputStyle}
          />

          {helperText ? <span id={helperId} className="form-help-text">{helperText}</span> : null}
          {errorText ? <span id={errorId} className="form-error">{errorText}</span> : null}
        </div>
      </div>
    </div>
  );
}
