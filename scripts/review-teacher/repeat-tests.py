# Run: NODE_BINARY=/path/to/node22 python3 scripts/review-teacher/repeat-tests.py sequential 1 40
# Then repeat with: parallel-after-build 3 40. All logs stay in /tmp.
import concurrent.futures
import json
import os
from pathlib import Path
import subprocess
import sys
import time
node=os.environ.get('NODE_BINARY','node')
label=sys.argv[1]
workers=int(sys.argv[2])
repeats=int(sys.argv[3])
files=['components/TeacherPresentation.test.tsx','components/TeacherClassroom.test.tsx','components/ClassroomMode.test.tsx']
root=Path('/tmp/teacher-stress-'+label)
root.mkdir(exist_ok=True)
cmd=[node,'node_modules/vitest/vitest.mjs','run',*files]
def worker(number):
 results=[]
 for run in range(1,repeats+1):
  start=time.monotonic()
  result=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
  path=root/f'worker-{number}-run-{run:02}.log'
  path.write_text(result.stdout)
  results.append({'worker':number,'run':run,'exitCode':result.returncode,'seconds':round(time.monotonic()-start,2)})
  if result.returncode: print(f'{label} worker {number} run {run}: FAIL ({path})',flush=True)
  elif run%10==0: print(f'{label} worker {number}: {run}/{repeats} complete',flush=True)
 return results
with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
 runs=[r for batch in pool.map(worker,range(1,workers+1)) for r in batch]
report={'label':label,'node':subprocess.check_output([node,'--version'],text=True).strip(),'workers':workers,'runsPerWorker':repeats,'command':cmd,'runs':runs,'failureCount':sum(r['exitCode']!=0 for r in runs)}
(root/'summary.json').write_text(json.dumps(report,indent=2)+'\n')
print(f"{label}: {len(runs)} runs, {report['failureCount']} failures",flush=True)
sys.exit(1 if report['failureCount'] else 0)
