import CrudTemplate from './CrudTemplate';

export default function Employees() {
  // Fetch employee details on row click - robust handling of different response shapes
  const handleEmployeeRowClick = async (employee) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employee/details/${employee.empID}`);
      if (!res.ok) {
        console.error("Server returned non-OK status:", res.status, await res.text());
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();

      // backend might return:
      // - an object { employeeName: ..., regionName: ... }
      // - or an array like [{...}]
      // - or a nested array from a procedure [[{...}], ...]
      // handle all those cases safely:
      if (!data) return null;

      // If it's an array with objects, pick the first useful object
      if (Array.isArray(data)) {
        // flatten nested arrays one level (e.g. results from CALL or some drivers)
        const flat = data.flat ? data.flat() : data;
        const firstObj = flat.find((x) => x && typeof x === 'object');
        return firstObj || null;
      }

      // If it's an object but contains results array (rare), normalize
      if (typeof data === 'object') {
        // If the object looks like {0: {...}} or { results: [...] } handle it
        if (Array.isArray(data.results) && data.results.length > 0) return data.results[0];
        // If it's already the expected object, return it
        return data;
      }

      // fallback
      return null;
    } catch (err) {
      console.error("❌ Failed to fetch employee details:", err);
      return null;
    }
  };

  return (
    <CrudTemplate
      title="Employee"
      apiEndpoint="http://localhost:5000/api/employees"
      columns={["empID", "name", "role", "salary", "hireDate", "plantID", "email"]}
      idField="empID"
      onRowClick={handleEmployeeRowClick}
    />
  );
}
