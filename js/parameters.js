let parameters = {
    plane: {
        scale: 20,
        gridWidth: 60,
        noiseScale: 0.6,
        resolution: 80,
        color: [0, 128, 255],
    },
    simulation: {
        active: true,
        speed: 1,
        color: [255, 255, 255],
        button: function(){ alert("clicked") },
    },
    clouds: {
        thickness: 0.5,
        size: 0.7,
        count: 1.3,
    },
};