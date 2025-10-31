import CrudTemplate from './CrudTemplate';

export default function Employees() {
  // Fetch employee details on row click
  const handleEmployeeRowClick = async (employee) => {
    try {
      const res = await fetch(`http://localhost:5000/api/employee/details/${employee.empID}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      return data; // handled by CrudTemplate
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
