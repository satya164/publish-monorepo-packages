export type WorkspacePackages = Record<
  string,
  {
    location: string;
    workspaceDependencies: string[];
    mismatchedWorkspaceDependencies: string[];
  }
>;
