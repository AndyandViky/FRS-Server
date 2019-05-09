
const str = '{"1": 22263, "0": 22376, "3": 21393, "2": 2228,"1": 22372, "0": 22375, "3": 22046, "2": 21832, "5": 22301, "4": 22245, "6": 2220,"1": 22046, "0": 22373, "3": 22129, "2": 22372, "5": 21514, "4": 22024, "6": 220}'

const jsonStr = JSON.parse(str)
const recomnondIds = []
for (const key in jsonStr) {
    recomnondIds.push(jsonStr[key])
}
console.log(recomnondIds)
