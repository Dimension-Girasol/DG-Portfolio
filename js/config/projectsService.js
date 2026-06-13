(function () {
  let projectsRequest = null;
  const projectDetailRequests = new Map();

  const getBaseUrl = () => (window.DGApiConfig?.baseUrl || "").replace(/\/$/, "");

  const request = async (path) => {
    const response = await fetch(`${getBaseUrl()}${path}`);

    if (!response.ok) {
      throw new Error(`API error ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  window.DGProjectsService = {
    getProjects: () => {
      if (!projectsRequest) {
        projectsRequest = request("/projects");
      }

      return projectsRequest;
    },
    getProjectById: (projectId) => {
      const key = String(projectId);
      if (!projectDetailRequests.has(key)) {
        projectDetailRequests.set(key, request(`/projects/${encodeURIComponent(projectId)}`));
      }

      return projectDetailRequests.get(key);
    }
  };
})();
