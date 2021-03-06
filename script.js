// author: jotaro shigeyama,2020
let sensorNoise = 10; //up and down arrow
let drivingNoise = 0; //right and left arrow
let robot, battleField;

function setup() {
    createCanvas(710, 400);
    // Create robot and battlefield.
    battleField = new BattleField(random(width), random(height));
    robot = new Robot(random(width), random(height));
    setSensors();
}

function setSensors() {
    //TODO1: YOUR SENSOR SETUP HERE. YOU CAN SET AS MANY SENSORS AS YOU WISH (sensor position is relative to the robot's center)
    robot.set_sensor(20, 0); //sensor[0]
    robot.set_sensor(-10, -20);
    robot.set_sensor(-10, 20); //sensor[2]
}

function draw() {
    background(255);
    battleField.draw();

    //TODO2: YOUR ROBOT LOGIC HERE. USE moveForward() and rotateRight() or rotateLeft()
    {
        //TODO3: below function returns 0, 1, 2 as color at the field.
        //if you change the function as get_sensor_values_at_BF(battleField) then it will return sensor values with noise.
        //the sensor value now returns gaussian noise with mean - (100,200,300) and std sensorNoise.
        //you can increase / decrease sensorNoise with up,down arrow key.
        sensors = robot.get_sensor_values_at_BF(battleField);
        //example
        // if (sensors[1] == 1) {
        //     robot.moveForward();
        // } else {
        //     robot.rotateRight(0.01); //unit:radian
        // }
        robot.moveForward();
        fill(255, 0, 0);

        //TODO4: use debug text if you need.
        text("you can set some debug message here", 10, 20);
        text("Sensor noise is set to " + sensorNoise.toString(), 10, height - 20);
        text("Driving noise is set to " + drivingNoise.toString(), 10, height - 10);
    }
    robot.draw();
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        sensorNoise += 10;
    } else if (keyCode === DOWN_ARROW) {
        sensorNoise -= 10;
        sensorNoise = max(0, sensorNoise);
    } else if (keyCode === RIGHT_ARROW) {
        drivingNoise += 1;
        drivingNoise = max(0, drivingNoise);
    } else if (keyCode === LEFT_ARROW) {
        drivingNoise -= 1;
        drivingNoise = max(0, drivingNoise);
    }
}

function mouseClicked() {
    robot = new Robot(mouseX, mouseY);
    setSensors();
}


///////////////////////////////////////////////////////////////
/////// YOU CAN HELP JOTARO MAKE BELOW CODE BETTER :)
///////////////////////////////////////////////////////////////

function rotate_(cx, cy, x, y, angle) {
    var radians = -angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}
// Robot class
class Robot {
    constructor(x, y, d) {
        this.x = x
        this.y = y
        this.diameter = width / 10;
        this.rotation = 0;
        this.sensors = [];
    }

    moveForward() {
        let step = 1;
        this.x += step * cos(this.rotation);
        this.y += step * sin(this.rotation);
        for (let s of this.sensors) {
            s.x += step * cos(this.rotation);
            s.y += step * sin(this.rotation);
        }
        if (drivingNoise > 0) {
            let noise = randomGaussian(0, drivingNoise);
            this.rotate(noise * 3.1415 / 180);
        }
    }
    rotateRight(r) {
        this.rotate(r);
    }
    rotateLeft(r) {
        this.rotate(-r);
    }
    rotate(rotation) {
        this.rotation += rotation;
        for (let s of this.sensors) {
            let new_pos = rotate_(this.x, this.y, s.x, s.y, rotation);
            s.update_pos(new_pos[0], new_pos[1]);
        }
    }

    draw() {
        fill(44, 169, 173);
        ellipse(this.x, this.y, this.diameter, this.diameter);
        for (let s of this.sensors) {
            s.draw();
        }
        strokeWeight(5);
        stroke(2, 87, 114);
        line(this.x + this.diameter / 2 * cos(this.rotation),
            this.y + this.diameter / 2 * sin(this.rotation),
            this.x + (10 + this.diameter / 2) * cos(this.rotation),
            this.y + (10 + this.diameter / 2) * sin(this.rotation));

    }
    set_sensor(x, y) {
        let s = new Sensor(this.x + x, this.y + y);
        this.sensors.push(s);
    }
    get_color_values_at_BF(battleField) {
        let res = [];
        for (let s of this.sensors) {
            res.push(battleField.get_color_at_point(s.x, s.y));
        }
        return res;
    }
    get_sensor_values_at_BF(battleField) {
        let res = [];
        for (let s of this.sensors) {
            let val = battleField.get_color_at_point(s.x, s.y);
            res.push(max(0, randomGaussian((val + 1) * 100, sensorNoise)));
        }
        return res;
    }
}

class Sensor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.diameter = width / 50;
    }
    draw() {
        fill(255, 51, 0);
        ellipse(this.x, this.y, this.diameter, this.diameter);
    }
    update_pos(x, y) {
        this.x = x;
        this.y = y;
    }
}

class BattleField {
    constructor(x, y) {
        this.cx = x;
        this.cy = y;
        this.num_circle = 19;
        this.diameter = max(width, height) * 2;
        this.color = 1;
    }
    draw() {
        this.color = 1;
        for (let i = 0; i < this.num_circle; i++) {
            let d = this.diameter / this.num_circle;
            this.switch_color();
            strokeWeight(0);
            ellipse(this.cx, this.cy,
                this.diameter - d * i, this.diameter - d * i)
        }
    }
    switch_color() {
        switch (this.color) {
            case 0:
                fill(172);
                this.color = 1;
                break;
            case 1:
                fill(255);
                this.color = 2;
                break;
            case 2:
                fill(0);
                this.color = 0;
                break;
            default:
                console.error("something went wrong");
                break;
        }
    }
    get_color_at_point(px, py) {
        let d = sqrt((px - this.cx) * (px - this.cx) +
            (py - this.cy) * (py - this.cy));
        let t = this.diameter / this.num_circle / 2;
        let r = d / t;
        return parseInt(3 - r % 3);
    }


}