from typing import Callable, List, TypedDict

from langgraph.graph import END, StateGraph

from app.agents import planner_agent, research_agent, writer_agent


# --- Shared state ka shape (whiteboard) ---
class ResearchState(TypedDict):
    query: str
    session_id: str
    plan: List[dict]
    findings: List[dict]
    report: str
    emit: Callable  # live update bhejne wala function (Part 14)


def _emit(state: ResearchState, agent: str, msg: str):
    emitter = state.get("emit")
    if callable(emitter):
        try:
            emitter(agent, msg)
        except Exception:
            pass


# --- Node handlers for executing agents and updating whiteboard state ---
def plan_node(state: ResearchState):
    _emit(state, "Planner", "Deconstructing query into research sub-tasks...")
    plan = planner_agent(state["query"])
    _emit(state, "Planner", f"Generated {len(plan)} targeted sub-tasks.")
    return {"plan": plan}


def research_node(state: ResearchState):
    _emit(state, "Research", "Gathering data using web search & document vector tools...")
    findings = research_agent(state["plan"], state["session_id"])
    _emit(state, "Research", f"Retrieved {len(findings)} research findings.")
    return {"findings": findings}


def write_node(state: ResearchState):
    _emit(state, "Writer", "Synthesizing final report with inline citations...")
    report = writer_agent(state["query"], state["findings"])
    _emit(state, "Writer", "Research report complete!")
    return {"report": report}


# --- Graph banao: teen node, ek seedhi line ---
def build_graph():
    g = StateGraph(ResearchState)
    g.add_node("planner", plan_node)
    g.add_node("research", research_node)
    g.add_node("writer", write_node)
    g.set_entry_point("planner")
    g.add_edge("planner", "research")
    g.add_edge("research", "writer")
    g.add_edge("writer", END)
    return g.compile()


research_graph = build_graph()
