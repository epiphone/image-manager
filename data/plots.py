from collections import defaultdict
from datetime import datetime
import math
import sys
import matplotlib.pyplot as plt

GROUP_BY_SECONDS = 1


def read_log(log_name):
    res = {
        "ok": defaultdict(list),
        "error": defaultdict(list),
        "req": defaultdict(list),
    }
    first_date = None
    with open(log_name, "r") as f:
        for row in f:
            iso_date, status, info = row.split(" | ")
            date = datetime.fromisoformat(iso_date)
            if not first_date:
                first_date = date

            group = math.floor((date - first_date).total_seconds() / GROUP_BY_SECONDS)
            if group > 675 / GROUP_BY_SECONDS:
                break
            if status == "ERROR":
                res["error"][group].append(info)
            elif info == "REQUEST\n":
                res["req"][group].append(info)
            else:
                res["ok"][group].append(int(info))
    return res


def cumulative(xs):
    res = []
    for x in xs:
        res.append(x if res == [] else x + res[-1])
    return res


data = read_log(sys.argv[1])
MAX_X = max(data["req"].keys())
RANGE_X = range(0, MAX_X + 1)
fig, [ax1, ax2, ax3] = plt.subplots(3, 1, sharex=True)
plt.xlabel("Seconds elapsed")


ax1.plot(RANGE_X, cumulative(len(data["req"][x]) for x in RANGE_X), "g")
ax1.set_title("Number of requests, cumulative")
ax1.set_ylabel("count")

ax2.plot(
    list(data["error"].keys()), cumulative(len(v) for v in data["error"].values()), "r"
)
ax2.set_title("Number of errors, cumulative")
ax2.set_ylabel("count")

ax3.plot(list(data["ok"].keys()), [sum(v) / len(v) / 1000 for v in data["ok"].values()])
ax3.set_title("Average response time, 1s interval")
ax3.set_ylabel("seconds")
ax3.set_ylim(0, max(sum(v) / len(v) / 1000 for v in data["ok"].values()))

plt.show()
