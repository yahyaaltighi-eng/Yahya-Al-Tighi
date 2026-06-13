from ortools.sat.python import cp_model
from schemas import GenerationRequest, GenerationResponse
import math

def generate_timetable_pipeline(req: GenerationRequest):
    model = cp_model.CpModel()
    
    days = req.settings.workDays
    num_days = len(days)
    
    # Pre-process data
    all_teachers = req.teachers
    all_classes = req.classes
    
    # variables: (class, day, period) -> (teacher, subject)
    # To simplify, we'll create a boolean variable for each (class, teacher, subject, day, period)
    assignments = {}
    
    for c in all_classes:
        num_periods = c.periodsPerDay
        for s in c.subjects:
            # Find eligible teachers for this subject
            eligible_teachers = [t for t in all_teachers if s.name in t.subject.split(', ')]
            
            for t in eligible_teachers:
                for d_idx, d in enumerate(days):
                    for p in range(num_periods):
                        assignments[(c.id, t.id, s.name, d_idx, p)] = model.NewBoolVar(
                            f'assign_{c.id}_{t.id}_{s.name}_{d_idx}_{p}'
                        )

    # Constraints
    
    # 1. Each class period has at most one subject/teacher
    for c in all_classes:
        for d_idx in range(num_days):
            for p in range(c.periodsPerDay):
                model.AddAtMostOne(
                    assignments[(c.id, t.id, s.name, d_idx, p)]
                    for s in c.subjects
                    for t in all_teachers
                    if (c.id, t.id, s.name, d_idx, p) in assignments
                )

    # 2. Teacher can only be in one class at a time
    for t in all_teachers:
        for d_idx in range(num_days):
            # Find max periods across all classes
            max_periods = max(c.periodsPerDay for c in all_classes)
            for p in range(max_periods):
                relevant_vars = [
                    assignments[(c.id, t.id, s.name, d_idx, p)]
                    for c in all_classes
                    for s in c.subjects
                    if (c.id, t.id, s.name, d_idx, p) in assignments and p < c.periodsPerDay
                ]
                if relevant_vars:
                    model.AddAtMostOne(relevant_vars)

    # 3. Subject hours requirement
    for c in all_classes:
        for s in c.subjects:
            model.Add(
                sum(
                    assignments[(c.id, t.id, s.name, d_idx, p)]
                    for t in all_teachers
                    for d_idx in range(num_days)
                    for p in range(c.periodsPerDay)
                    if (c.id, t.id, s.name, d_idx, p) in assignments
                ) == s.hours
            )

    # 4. Teacher Max Load
    for t in all_teachers:
        model.Add(
            sum(
                assignments[(c.id, t.id, s.name, d_idx, p)]
                for c in all_classes
                for s in c.subjects
                for d_idx in range(num_days)
                for p in range(c.periodsPerDay)
                if (c.id, t.id, s.name, d_idx, p) in assignments
            ) <= t.maxLoad
        )

    # 5. Teacher Max/Min Per Day
    for t in all_teachers:
        for d_idx, d in enumerate(days):
            daily_vars = [
                assignments[(c.id, t.id, s.name, d_idx, p)]
                for c in all_classes
                for s in c.subjects
                for p in range(c.periodsPerDay)
                if (c.id, t.id, s.name, d_idx, p) in assignments
            ]
            if daily_vars:
                # Max per day
                model.Add(sum(daily_vars) <= t.maxPerDay)
                
                # Min per day (only if teacher works that day)
                if d not in t.freeDays:
                    # This is tricky, minPerDay usually applies if they are assigned anything
                    # For simplicity, we skip minPerDay or implement it as a soft constraint
                    pass

    # 6. Free Days
    for t in all_teachers:
        for d_idx, d in enumerate(days):
            if d in t.freeDays:
                for c in all_classes:
                    for s in c.subjects:
                        for p in range(c.periodsPerDay):
                            if (c.id, t.id, s.name, d_idx, p) in assignments:
                                model.Add(assignments[(c.id, t.id, s.name, d_idx, p)] == 0)

    # Solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0
    status = solver.Solve(model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        timetable = []
        for (c_id, t_id, s_name, d_idx, p), var in assignments.items():
            if solver.Value(var):
                timetable.append({
                    "day": days[d_idx],
                    "period": p + 1,
                    "subject": s_name,
                    "teacher": next(t.name for t in all_teachers if t.id == t_id),
                    "class_id": c_id
                })
        
        return {
            "status": "SUCCESS",
            "top_solutions": [{"timetables": timetable}],
            "diagnostics": None
        }
    else:
        return {
            "status": "INFEASIBLE",
            "top_solutions": [],
            "diagnostics": {"error": "Could not find a valid timetable with given constraints."}
        }
