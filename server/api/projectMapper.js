(function () {
  const fallbackCover = window.DGProjectModel?.fallbackCover || "/src/assets/images/index/dg-log_hero2.png";

  const asArray = (value) => (Array.isArray(value) ? value : []);

  const sortImages = (images) =>
    asArray(images)
      .slice()
      .sort((a, b) => {
        return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || (a.projectImagesId ?? 0) - (b.projectImagesId ?? 0);
      });

  const getProjectCreatedAt = (project) => {
    if (project.createdAt) return project.createdAt;

    const imageDates = asArray(project.images)
      .map((image) => image.createdAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return imageDates[0] || project.initDate || null;
  };

  const sortProjectsByCreatedAtDesc = (projects) =>
    asArray(projects)
      .slice()
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

  const mapImage = (image, projectName, index) => ({
    id: image.projectImagesId,
    name: image.name || `${projectName} ${index + 1}`,
    src: image.routeMedium || image.routeFull || image.routeThumb || image.routeOriginal || fallbackCover,
    fullSrc: image.routeFull || image.routeOriginal || image.routeMedium || image.routeThumb || fallbackCover,
    thumbSrc: image.routeThumb || image.routeMedium || image.routeFull || image.routeOriginal || fallbackCover,
    alt: `${projectName} - imagen ${index + 1}`,
    width: image.width,
    height: image.height,
    createdAt: image.createdAt || null,
    isCover: Boolean(image.isCover)
  });

  const uniqueTags = (values) =>
    asArray(values)
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .filter((value, index, all) => all.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index);

  const mapProject = (project) => {
    const name = project.name || "Proyecto";
    const images = sortImages(project.images).map((image, index) => mapImage(image, name, index));
    const typeTags = uniqueTags([project.type, ...asArray(project.material), project.size]);

    return {
      id: project.projectId,
      name,
      designer: project.designer
        ? {
            id: project.designer.designerId,
            name: project.designer.name || "",
            site: project.designer.site || "",
            theme: project.designer.theme || ""
          }
        : null,
      authors: uniqueTags(project.author),
      images,
      cover: images.find((image) => image.isCover) || images[0] || window.DGProjectModel?.createFallbackImage(name) || {
        src: fallbackCover,
        fullSrc: fallbackCover,
        thumbSrc: fallbackCover,
        alt: `${name} - sin imagen`
      },
      initDate: project.initDate || null,
      endDate: project.endDate || null,
      createdAt: getProjectCreatedAt(project),
      inProgress: Boolean(project.inProgress),
      type: project.type || "",
      material: asArray(project.material),
      size: project.size || "",
      tags: typeTags
    };
  };

  window.DGProjectMapper = {
    mapProject,
    mapProjects: (projects) => sortProjectsByCreatedAtDesc(asArray(projects).map(mapProject))
  };
})();
