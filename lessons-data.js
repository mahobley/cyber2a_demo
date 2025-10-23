export const lessonMetadata = [
  {
    id: 'geo-module-01',
    title: 'Climate Model Calibration Intensive',
    description:
      'Guide students through bias correction and parameter tuning for coupled climate models using real-world reanalysis products.',
    styles: ['Active Learning', 'Lab'],
    audience: ['Graduate Students'],
    length: 'Module',
    link: 'https://example.com/climate-model-calibration',
    authors: [
      { name: 'Dr. Amara Singh', institution: 'Center for Earth System Science' },
      { name: 'Prof. Liam Ortega', institution: 'Coastal Climate Laboratory' },
    ],
    syllabus: 'Earth Systems Analytics Syllabus 2024',
    navigation: {
      previous: null,
      next: 'geo-module-02',
    },
    taughtCount: 7,
    adaptedFrom: {
      title: 'GEO 510 Climate Model Calibration Workshop',
      link: 'https://example.com/original/climate-calibration',
      author: 'Global Climate Teaching Collective',
    },
    datasets: [
      {
        id: 'era5-reanalysis-subset',
        name: 'ERA5 Reanalysis Subset',
        url: 'https://example.com/datasets/era5-reanalysis',
        domain: 'Atmospheric Dynamics',
        methods: ['Temporal Forecasting', 'Spatial Interpolation'],
        size: 'Hourly fields (2000-2020) | 12 GB',
        citation:
          'European Centre for Medium-Range Weather Forecasts (2023). ERA5 Reanalysis Subset.',
        sizeCategory: 'Large',
        dataTypes: ['Gridded Time Series', 'NetCDF'],
        topics: ['Climate Modeling', 'Reanalysis Data'],
      },
      {
        id: 'global-carbon-flux-inventory',
        name: 'Global Carbon Flux Inventory',
        url: 'https://example.com/datasets/carbon-flux',
        domain: 'Biogeochemical Cycles',
        methods: ['Regression Modeling', 'Uncertainty Quantification'],
        size: 'Annual flux estimates (1990-2022) | 2.4 GB',
        citation:
          'Singh, A. (2024). Global Carbon Flux Inventory v3. Center for Earth System Science.',
        sizeCategory: 'Medium',
        dataTypes: ['Tabular Aggregates', 'Raster Grids'],
        topics: ['Carbon Cycle', 'Climate Forcing'],
      },
    ],
  },
  {
    id: 'geo-module-02',
    title: 'Satellite Remote Sensing Field Lab',
    description:
      'Hands-on experience with multispectral imagery, surface reflectance correction, and vegetation index derivation.',
    styles: ['Lab'],
    audience: ['Graduate Students', 'Undergraduate Students'],
    length: 'Lesson',
    link: 'https://example.com/satellite-remote-sensing-lab',
    authors: [
      { name: 'Dr. Amara Singh', institution: 'Center for Earth System Science' },
    ],
    syllabus: 'Earth Systems Analytics Syllabus 2024',
    navigation: {
      previous: 'geo-module-01',
      next: 'geo-module-03',
    },
    taughtCount: 5,
    modifiedBy: [
      {
        title: 'Tropical Remote Sensing Studio',
        curator: 'Dr. Mei Chen',
        institution: 'Pacific Earth Observatory',
        link: 'https://example.com/lessons/tropical-remote-sensing',
      },
      {
        title: 'Urban Heat Island Remote Sensing Lab',
        curator: 'Prof. Javier Morales',
        institution: 'Metropolitan Climate Institute',
        link: 'https://example.com/lessons/urban-heat-lab',
      },
    ],
    datasets: [
      {
        id: 'sentinel2-surface-reflectance',
        name: 'Sentinel-2 Surface Reflectance Tiles',
        url: 'https://example.com/datasets/sentinel2-reflectance',
        domain: 'Remote Sensing',
        methods: ['Image Classification', 'Spectral Indexing'],
        size: '50 tiles (10m resolution) | 28 GB',
        citation:
          'European Space Agency (2024). Sentinel-2 L2A Surface Reflectance (custom region subset).',
        sizeCategory: 'Large',
        dataTypes: ['Multispectral Imagery', 'GeoTIFF'],
        topics: ['Vegetation Analysis', 'Land Cover Mapping'],
      },
      {
        id: 'lidar-canopy-height-models',
        name: 'LiDAR Canopy Height Models',
        url: 'https://example.com/datasets/lidar-canopy',
        domain: 'Forest Structure',
        methods: ['3D Reconstruction', 'Feature Engineering'],
        size: 'Regional tiles (1m resolution) | 9 GB',
        citation:
          'Ortega, L. (2023). Coastal Canopy LiDAR Products. Coastal Climate Laboratory.',
        sizeCategory: 'Medium',
        dataTypes: ['Point Clouds', 'Raster Grids'],
        topics: ['Forest Biomass', 'Habitat Monitoring'],
      },
    ],
  },
  {
    id: 'geo-module-03',
    title: 'Watershed Resilience Scenario Planning',
    description:
      'Capstone studio where teams evaluate flood mitigation strategies under future climate projections and land-use change.',
    styles: ['Active Learning', 'Lecture'],
    audience: ['Graduate Students'],
    length: 'Unit',
    link: 'https://example.com/watershed-resilience-studio',
    authors: [
      { name: 'Prof. Liam Ortega', institution: 'Coastal Climate Laboratory' },
    ],
    syllabus: 'Earth Systems Analytics Syllabus 2024',
    navigation: {
      previous: 'geo-module-02',
      next: null,
    },
    taughtCount: 3,
    modifiedBy: [
      {
        title: 'Coastal Flood Resilience Workshop',
        curator: 'Dr. Amina Patel',
        institution: 'Arctic Systems Lab',
        link: 'https://example.com/lessons/coastal-flood-resilience',
      },
    ],
    adaptedFrom: {
      title: 'NOAA Watershed Adaptation Toolkit',
      link: 'https://example.com/original/noaa-watershed-toolkit',
      author: 'NOAA Climate Program',
    },
    datasets: [
      {
        id: 'river-discharge-archive',
        name: 'River Discharge Archive',
        url: 'https://example.com/datasets/river-discharge',
        domain: 'Hydrology',
        methods: ['Time Series Analysis', 'Extreme Value Modeling'],
        size: 'Daily discharge (1980-2023) | 600 MB',
        citation:
          'National Hydrologic Observatory (2024). River Discharge Archive.',
        sizeCategory: 'Medium',
        dataTypes: ['Time Series', 'CSV'],
        topics: ['Hydrologic Modeling', 'Flood Risk'],
      },
      {
        id: 'land-use-change-projections',
        name: 'Land Use Change Projections',
        url: 'https://example.com/datasets/land-use-projections',
        domain: 'Landscape Dynamics',
        methods: ['Scenario Modeling', 'Spatial Simulation'],
        size: 'Scenario rasters (2050 & 2080) | 4.5 GB',
        citation:
          'Ortega, L. & Singh, A. (2024). Coastal Watershed Land Use Projections.',
        sizeCategory: 'Medium',
        dataTypes: ['Raster Grids', 'GeoTIFF'],
        topics: ['Land Use Planning', 'Climate Adaptation'],
      },
    ],
  },
];
