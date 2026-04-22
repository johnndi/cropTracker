import {create} from 'zustand';
import {persist, devtools} from 'zustand/middleware';

const useFieldStore = (set) => ({
  fields: [],
  setFields: (newFields) => set({ fields: newFields }),
  addField: (newField) => set((state) => ({ fields: [...state.fields, newField] })),
  updateField: (updatedField) =>
    set((state) => ({
        fields: state.fields.map((field) =>
            field.id === updatedField.id ? updatedField : field
        ),
    })),
  deleteField: (fieldId) =>
    set((state) => ({
        fields: state.fields.filter((field) => field.id !== fieldId),
    })),
});
const useFieldStore = create(
  devtools(persist(useFieldStore, { name: "field" }))
);
export default useFieldStore;
