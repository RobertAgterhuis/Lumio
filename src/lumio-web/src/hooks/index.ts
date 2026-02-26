// Query hooks
export { useDomainQuery, useDomainDetailQuery, domainKeys } from "./useDomainQuery";

// Mutation hooks
export {
  useDomainCreate,
  useDomainUpdate,
  useDomainDelete,
  useDomainMutations,
} from "./useDomainMutation";

// Utility hooks
export { useIdleTimer } from "./useIdleTimer";
export { useKeyboardShortcuts } from "./useKeyboardShortcuts";
export { useTheme } from "./useTheme";
export {
  useWizardProgress,
  getWizardsWithProgress,
  clearAllWizardProgress,
} from "./useWizardProgress";
export { useDocumenten, type PersoonlijkDocument, type DocumentVersie } from "./useDocumenten";
