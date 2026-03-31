import { useState } from "react";
import "./CreateLayoutForm.css";

interface CreateLayoutFormProps {
  onSubmit: (rows: number, cols: number) => void;
  isLoading: boolean;
  error?: string | null;
  /** "empty-state" renders a centered card for first-time setup.
   *  "panel" (default) renders an inline compact form. */
  variant?: "empty-state" | "panel";
  onCancel?: () => void;
}

function validateDimension(value: number): string | null {
  if (isNaN(value) || value < 2) return "Minimum value is 2.";
  if (value > 30) return "Maximum value is 30.";
  return null;
}

export default function CreateLayoutForm({
  onSubmit,
  isLoading,
  error,
  variant = "panel",
  onCancel,
}: CreateLayoutFormProps) {
  const [rows, setRows] = useState<string>("5");
  const [cols, setCols] = useState<string>("8");
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [colsError, setColsError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRows = parseInt(rows, 10);
    const parsedCols = parseInt(cols, 10);
    const re = validateDimension(parsedRows);
    const ce = validateDimension(parsedCols);
    setRowsError(re);
    setColsError(ce);
    if (re || ce) return;
    onSubmit(parsedRows, parsedCols);
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRows(e.target.value);
    setRowsError(validateDimension(parseInt(e.target.value, 10)));
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCols(e.target.value);
    setColsError(validateDimension(parseInt(e.target.value, 10)));
  };

  if (variant === "empty-state") {
    return (
      <div className="create-layout-form create-layout-form--empty-state">
        <h2 className="create-layout-form__heading">Create Store Layout</h2>
        <p className="create-layout-form__description">
          Define the grid dimensions for your store layout. These cannot be
          changed after creation.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="create-layout-form__stacked-fields">
            <div className="create-layout-form__field">
              <label htmlFor="layout-rows-empty">Rows</label>
              <input
                id="layout-rows-empty"
                type="number"
                min={2}
                max={30}
                value={rows}
                onChange={handleRowsChange}
                required
              />
              {rowsError && (
                <span className="create-layout-form__field-error">{rowsError}</span>
              )}
            </div>
            <div className="create-layout-form__field">
              <label htmlFor="layout-cols-empty">Columns</label>
              <input
                id="layout-cols-empty"
                type="number"
                min={2}
                max={30}
                value={cols}
                onChange={handleColsChange}
                required
              />
              {colsError && (
                <span className="create-layout-form__field-error">{colsError}</span>
              )}
            </div>
          </div>
          <p className="create-layout-form__tip">
            Tip: A {rows}×{cols} grid works well for a small store. You can
            always create a new layout version later with different dimensions.
          </p>
          <button
            type="submit"
            className="create-layout-form__submit create-layout-form__submit--full"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Layout"}
          </button>
          {error && <div className="create-layout-form__error">{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="create-layout-form">
      <div className="create-layout-form__panel-header">
        <span className="create-layout-form__title">New layout version</span>
        {onCancel && (
          <button
            type="button"
            className="create-layout-form__cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="create-layout-form__row">
          <div className="create-layout-form__field">
            <label htmlFor="layout-rows">Rows</label>
            <input
              id="layout-rows"
              type="number"
              min={2}
              max={30}
              value={rows}
              onChange={handleRowsChange}
              required
            />
            {rowsError && (
              <span className="create-layout-form__field-error">{rowsError}</span>
            )}
          </div>
          <div className="create-layout-form__field">
            <label htmlFor="layout-cols">Columns</label>
            <input
              id="layout-cols"
              type="number"
              min={2}
              max={30}
              value={cols}
              onChange={handleColsChange}
              required
            />
            {colsError && (
              <span className="create-layout-form__field-error">{colsError}</span>
            )}
          </div>
          <button
            type="submit"
            className="create-layout-form__submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create layout"}
          </button>
        </div>
        <p className="create-layout-form__hint">
          Grid dimensions can be 2–30 rows and 2–30 columns. New layouts are
          activated immediately.
        </p>
        {error && <div className="create-layout-form__error">{error}</div>}
      </form>
    </div>
  );
}
