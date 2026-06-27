---
name: Semantic Form Field Locator
description: "Resolves input fields in dynamic or poorly structured forms using semantic relationships, labels, and DOM proximity instead of relying solely on static IDs."
---

# 🧠 Semantic Form Field Locator

**Purpose:** Overcome the limitations of static IDs in dynamic or poorly structured forms. This skill ensures reliable form automation by locating the correct input field based on the semantic relationship between labels (`<label>`), descriptive text (placeholders), and the associated `<input>` component.

## 🚀 Activation Triggers

This skill MUST be activated when:
1.  The `extract_dom_schema()` tool returns insufficient, dynamic (auto-generated), or ambiguous IDs that prevent accurate form completion.
2.  The user provides a semantic description of the field (e.g., "the email", "first name") rather than a direct, exact ID match.

---

## ⚙️ Operational Protocol (Step-by-Step)

When this skill is triggered, you must execute the following systematic process:

### Step 1: Semantic Data Reception
*   **Action:** Identify the target semantic label or descriptive text (`Target_Text`) based on the user's request (e.g., "Email Address", "First Name", "Password").

### Step 2: Deep Structural Analysis (DOM Traversal)
*   **Action:** Perform an exhaustive scan of the extracted DOM schema or request localized HTML if necessary.
*   **Target:** Search for any element containing the `Target_Text` within its `<label>` text, `aria-label`, or as visible text immediately adjacent to a form field.

### Step 3: Association Mapping (Prioritized Hierarchy)
*   **Action:** Once the semantic container is located, trace its relationship to adjacent input fields.
*   **Rules:** You MUST evaluate relationships in the following descending order of reliability:
    1.  **The `for` Attribute (Highest Priority):** If a `<label>` element has a `for="[ID]"` attribute matching an input's ID, that is the definitive target ID.
    2.  **Structural Proximity (Medium Priority):** If no `for` attribute exists, identify the `<input>` field that is nested *inside* the `<label>` tag, or is the immediate sibling within the same parent container (e.g., the same `<div>` wrapper).
    3.  **Name / Placeholder Attributes (Lowest Priority - Fallback):** If steps 1 and 2 fail, use the `Target_Text` to search for direct matches within the `name`, `id` (fuzzy match), or `placeholder` attributes of nearby input fields.

### Step 4: Final ID Extraction
*   **Action:** Extract the exact `id` attribute of the firmly associated `<input>` field. This becomes your **Target ID**.
*   *Note: If the input lacks an ID but can be selected via a unique CSS selector based on its semantic wrapper, construct the query selector.*

### Step 5: Action Execution
*   **Action:** Execute the required tool (e.g., `fill_field(fieldId=Target_ID, value=Input_Value)`) using the verified Target ID.
