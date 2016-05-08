module.exports = (function Precision() {
    function pixelPrecision() {
        this.calculate = function(coordinates) {
           return coordinates;
        }
    };
     
    function tenthsFloorPrecision() {
        this.calculate = function(coordinates) {
            coordinates.X = Math.floor(coordinates.X / 10) * 10;
            coordinates.Y = Math.floor(coordinates.Y / 10) * 10;
            return coordinates;
        }
    };
     
    function tenthsCeilPrecision() {
        this.calculate = function(coordinates) {
            coordinates.X = Math.ceil(coordinates.X / 10) * 10;
            coordinates.Y = Math.ceil(coordinates.Y / 10) * 10;
            return coordinates;
        }
    };
     
    function customFloorPrecition(precision) {
        this.calculate = function(coordinates) {
            coordinates.X = Math.floor(coordinates.X / precision) * precision;
            coordinates.Y = Math.ceil(coordinates.Y / precision) * precision;
            return coordinates;
        }
    };

    function customCeilPrecition(precision) {
        this.calculate = function(coordinates) {
            coordinates.X = Math.ceil(coordinates.X / precision) * precision;
            coordinates.Y = Math.ceil(coordinates.Y / precision) * precision;
            return coordinates;
        }
    };

    var precision = new pixelPrecision();
    
    return {
        setPrecision: function(prs) {
            precision = prs;
        },
     
        calculate: function(coordinates) {
            return precision.calculate(coordinates);
        },

        pixelPrecision: pixelPrecision,
        tenthsFloorPrecision: tenthsFloorPrecision,
        tenthsCeilPrecision: tenthsCeilPrecision,
        customFloorPrecition: customFloorPrecition,
        customCeilPrecition: customCeilPrecition
    };
})();