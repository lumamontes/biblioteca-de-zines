export type FormAction = (formData: FormData) => Promise<void>;

export type TriageActions = {
  link: FormAction;
  archive: FormAction;
  reopenArchived: FormAction;
  relatedTask: FormAction;
  moderate: FormAction;
  influence: FormAction;
  simulate: FormAction;
};
