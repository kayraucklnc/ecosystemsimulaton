let parameters = {
    plane: {
        scale: 150,
        gridWidth: 120,
        noiseScale: 0.1,
        persistance: 0.534,
        lacunarity: 1.5,
        smoothness: 2.8,
        resolution: 120,
        heightMultiplier: 6,
        color: [0, 128, 255],
        gridVisible: false,
        waterHeight: -0.34
    },
    clouds: {
        thickness: 0.5,
        size: 0.7,
        count: 1.3,
    },
    simulation: {
        showPaths: true,
        showSpotlightWires: false,
        seed: (Math.random() * 1000.0) + "",
        humanAggressiveness: 1.0,
        entities: false,
        lightIntensity: 0.85,
    }
};