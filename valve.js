/**!
 *
 * Copyright 2016-2018 Uniquid Inc. or its affiliates. All Rights Reserved.
 *
 * License is in the "LICENSE" file accompanying this file.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 */

var valve = { level: 0, flow: 0, limit: 100 };

valve.start = function(limit, seconds, delta){
    valve.limit = limit;
    var valve_looper = setInterval(function(){
        _flow = valve.flow;
        _level = valve.level;
        if(_flow == 0){
            if(_level >= limit) _flow = 1;
            else {
                _level = _level + delta;
                if(_level > limit) _level = limit;
            }
        } else {
            if(_level <= 0) _flow = 0;
            else {
                _level = _level - delta;
                if(_level < 0) _level = 0;
            }
        }
        valve.level = _level;
        valve.flow = _flow;
    }, seconds*1000);
}

valve.getJSON = function(){
    var data = { timestamp: Date.now(), level: valve.level, flow: valve.flow, limit: valve.limit };
    return data;
}

module.exports = valve;
