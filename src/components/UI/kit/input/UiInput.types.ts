export interface IUiInputProps {
  modelValue: string | number | null | undefined;
  label?: string;
  placeholder?: string;
  autofocus?: boolean;
  autocomplete?: boolean | 'on' | 'off';
  type?: 'text' | 'password' | 'number' | 'email' | 'url';
  isError?: boolean;
  isClearable?: boolean;
  maxLength?: number;
  required?: boolean;
  errorText?: string;
  spellcheck?: boolean | 'default';
}

export interface IUiInputNumberProps extends IUiInputProps {
  isInteger?: boolean;
  disableNegative?: boolean;
  min?: number;
  max?: number;
}
