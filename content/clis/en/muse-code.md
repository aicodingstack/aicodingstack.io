## answer

Muse Code is Meta's terminal coding agent, powered by Muse Spark 1.2, for completing complex software engineering tasks across large repositories.

## introduction

Muse Code combines a main agent with persistent background agents. It plans changes, edits code, validates results, and records model calls, tool runs, approvals, and edits in a local append-only event log so sessions can resume after interruption.

## capabilities.items.0.title

Persistent background agents

## capabilities.items.0.description

Specialized background agents remain active throughout a session and report useful findings or next steps to the main agent.

## capabilities.items.1.title

Restart-safe execution

## capabilities.items.1.description

A local append-only event log records every model call, tool run, approval, and edit, allowing the runtime to replay and resume work after a crash.

## capabilities.items.2.title

Bundled planning skills

## capabilities.items.2.description

Built-in /plan, /grill, and /goal skills support approval-gated planning, plan review, and persistent work toward a specified objective.

## faq.items.0.question

What is Muse Code?

## faq.items.0.answer

Muse Code is Meta's terminal coding agent for planning, implementing, and validating software changes across large repositories.

## faq.items.1.question

Which model powers Muse Code?

## faq.items.1.answer

Muse Code is powered by Muse Spark 1.2, a coding-focused update to Meta's Muse Spark model family.

## faq.items.2.question

How do I install and launch Muse Code?

## faq.items.2.answer

Run Meta's official installation command on macOS or Linux, then launch the agent with muse from a terminal.

## faq.items.3.question

Is Muse Code open source?

## faq.items.3.answer

No public source repository or open-source license is provided for Muse Code. The distributed CLI is proprietary software.

## faq.items.4.question

How does Muse Code resume interrupted work?

## faq.items.4.answer

Muse Code keeps a local append-only event log of model calls, tool runs, approvals, and edits, allowing the runtime to replay and resume the session after a crash.
