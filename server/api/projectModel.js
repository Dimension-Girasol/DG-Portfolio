(function () {
  /**
   * @typedef {Object} DGProjectImage
   * @property {number|string} id
   * @property {string} name
   * @property {string} src
   * @property {string} fullSrc
   * @property {string} thumbSrc
   * @property {string} alt
   * @property {number=} width
   * @property {number=} height
   * @property {string|null=} createdAt
   * @property {boolean} isCover
   */

  /**
   * @typedef {Object} DGProject
   * @property {number|string} id
   * @property {string} name
   * @property {{id:number|string,name:string,site:string,theme:string}|null} designer
   * @property {string[]} authors
   * @property {DGProjectImage[]} images
   * @property {DGProjectImage} cover
   * @property {string|null} initDate
   * @property {string|null} endDate
   * @property {string|null} createdAt
   * @property {boolean} inProgress
   * @property {string} type
   * @property {string[]} material
   * @property {string} size
   * @property {string[]} tags
   */

  const fallbackCover = "/src/assets/images/index/dg-log_hero2.png";

  const createFallbackImage = (projectName) => ({
    id: "fallback",
    name: projectName,
    src: fallbackCover,
    fullSrc: fallbackCover,
    thumbSrc: fallbackCover,
    alt: `${projectName} - sin imagen`,
    createdAt: null,
    isCover: true
  });

  window.DGProjectModel = {
    fallbackCover,
    createFallbackImage
  };
})();
