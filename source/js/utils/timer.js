export default class Timer {
    start(resolve) {
        let startDate = Date.now();
        this.timer = setInterval(() => {
            let res = this.convertToTime(Math.floor((Date.now() - startDate) / 1000), this.timer);
            if (!res) {
                clearInterval(this.timer);
            }
            resolve(res);
        }, 1000);
    }
    convertToTime(seconds) {
        let secs = parseInt(seconds);
        let hh = secs / 3600;
        hh = parseInt(hh);
        let mmt = secs - (hh * 3600);
        let mm = mmt / 60;
        mm = parseInt(mm);
        let ss = mmt - (mm * 60);
        let dd
        if (hh > 23) {
            dd = hh / 24;
            dd = parseInt(dd);
            hh = hh - (dd * 24);
        } else {
            let dd = 0;
        }

        if (ss < 10) {
            ss = "0" + ss;
        }
        if (mm < 10) {
            mm = "0" + mm;
        }
        if (hh < 10) {
            hh = "0" + hh;
        }

        if (hh === 59 && mm === 59 && ss === 59) {
            return false;
        }

        return (hh + ":" + mm + ":" + ss);
    }
}
