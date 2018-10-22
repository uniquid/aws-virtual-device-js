/**!
 *
 * Copyright 2016-2018 Uniquid Inc. or its affiliates. All Rights Reserved.
 *
 * License is in the "LICENSE" file accompanying this file.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

var sineWave = { sin: 0, t: 0 };

sineWave.start = function(amp, freq, phase, time){
    var sinw_looper = setInterval(function(){
        var _sin = amp*Math.sin(freq*sineWave.t+phase);
        sineWave.sin = _sin;
        sineWave.t = sineWave.t + time;
        if(sineWave.t >= 1000){
            sineWave.t = 0;
        }
    }, time*1000);
}

sineWave.getJSON = function(){
    var data = { timestamp: Date.now(), sin: sineWave.sin };
    return data;
}

module.exports = sineWave;