import { MultiSelect, type MultiSelectOption } from "./ui/multi-select";

interface MultiSelectFilterProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  loading = false,
  disabled = false,
}: MultiSelectFilterProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase">
        {label}
      </label>
      {loading ? (
        <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50 text-sm text-gray-500">
          Loading...
        </div>
      ) : (
        <MultiSelect
          options={options}
          selected={selected}
          onChange={onChange}
          placeholder={placeholder}
          className="max-w-md"
          disabled={disabled}
        />
      )}
    </div>
  );
}
