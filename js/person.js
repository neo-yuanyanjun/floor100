var Person = function(x, y, img, cxt, gameInfo) {
    this.spirit = null;
    this.life = 80;
    this.lifeincremental = 0.2;
    this.x = x || 0;
    this.y = y || 0;
    this.cxt = cxt;
    this.img = img;
    this.width = 32;
    this.height = 32;
    this.gameInfo = gameInfo;
    this.xspeed = 4;
    this.yspeed = 4;
    this.yspeedup = 0.2;
    this.isDead = false;
    this.dir = "down";
    this.isjump = true;
    this.level = 0;
    this.init();
}
Person.prototype = {
    init: function() {
        var spirit = new Tool.spirit.Spirit({
            x: this.x,
            y: this.y,
            img: this.img,
            cxt: this.cxt,
            gameInfo: this.gameInfo,
            fps: 10,
            yspeed: this.yspeed,
            yspeedup: this.yspeedup
        });
        spirit.add("down", new Tool.spirit.Animation({
            w: this.width,
            h: this.height,
            startx: 64,
            sw: 64,
            sh: 64,
        }));
        spirit.add("normal", new Tool.spirit.Animation({
            w: this.width,
            h: this.height,
            sw: 64,
            sh: 64,
        }));
        spirit.add("up", new Tool.spirit.Animation({
            w: this.width,
            h: this.height,
            startx: 128,
            sw: 64,
            sh: 64,
        }));
        spirit.add("right", new Tool.spirit.Animation({
            w: this.width,
            h: this.height,
            startx: 320,
            sw: 64,
            sh: 64,
            fs: 2,
        }));
        spirit.add("left", new Tool.spirit.Animation({
            w: this.width,
            h: this.height,
            startx: 192,
            sw: 64,
            sh: 64,
            fs: 2,
        }));
        this.spirit = spirit;
    },
    draw: function() {
        this.spirit.draw();
    },
    updata: function() {
        this.spirit.updata();
        this.life += this.lifeincremental;
        if (this.life > 100) this.life = 100;
        var self_frame = this.spirit.size();
        var self_x = self_frame.x;
        var self_y = self_frame.y;
        if (self_x < 0) self_x = 0;
        if (self_frame.r > this.gameInfo.w) self_x = this.gameInfo.w - this.width;
        if (this.block) {
            var block_Frame = this.block.size();
            if (self_frame.r < block_Frame.x || self_frame.x > block_Frame.r) {
                this.down();
            }
        }
        if (self_frame.y < 0 || self_frame.b > this.gameInfo.h) {
            if (self_frame.y < 0) {
                self_y = 0;
            } else {
                self_y = this.gameInfo.h - this.height;
            }
            this.dead();
        }
        this.spirit.move(self_x, self_y);
    },
    changeDir: function(dir) {
        if (this.isDead) return;
        this.dir = dir;
        switch (dir) {
            case "left":
            case "right":
            case "normal":
                if (!this.isjump) {
                    this.spirit.change(dir);
                }
                break;
            case "down":
            case "up":
                if (this.isjump) {
                    this.spirit.change(dir);
                }
                break;
        }
        var xforce = this.block ? (this.block.xforce ? this.block.xforce : 0) : 0;
        switch (dir) {
            case "left":
                this.spirit.setXspeed(-this.xspeed + xforce);
                break;
            case "right":
                this.spirit.setXspeed(this.xspeed + xforce);
                break;
            default:
                this.spirit.setXspeed(xforce);
                break;
        }
    },
    checkBlock: function(block) {
        if (!this.block) {
            var block_Frame = block.size();
            var self_frame = this.spirit.size();
            var self = this;
            if (self_frame.x < block_Frame.r && self_frame.r > block_Frame.x) {
                if (self_frame.b < block_Frame.b && self_frame.b > block_Frame.y) {
                    this.isjump = false;
                    this.block = block;
                    this.spirit.setYspeed(block.yspeed, 0);
                    this.spirit.move(self_frame.x, block_Frame.y - self_frame.h);
                    block.belowMan(self);
                    if (this.dir == "left" || this.dir == "right") {
                        this.changeDir(this.dir);
                    } else {
                        this.changeDir("normal");
                    }
                    this.level += 1;
                    return true;
                }
            }
        }
        return false;
    },
    down: function() {
        this.isjump = true;
        this.block = null;
        this.changeDir("down");
        this.spirit.setYspeed(this.yspeed, this.yspeedup);
    },
    up: function() {
        this.isjump = true;
        this.block = null;
        this.changeDir("up");
        this.spirit.setYspeed(-6, this.yspeedup);
    },
    setXforce: function(force) {
        switch (this.dir) {
            case "left":
                this.spirit.setXspeed(-this.xspeed + force);
                break;
            case "right":
                this.spirit.setXspeed(this.xspeed + force);
                break;
            case "normal":
                this.spirit.setXspeed(force);
                break;
        }
    },
    setYspeed: function(yspeed) {
        this.spirit.setYspeed(yspeed, this.yspeedup);
    },
    cutlife: function(number) {
        this.life -= number;
        if (this.life <= 0) {
            this.dead();
        }
    },
    dead: function() {
        this.life = 0;
        this.isDead = true;
        this.changeDir("normal");
    }
};