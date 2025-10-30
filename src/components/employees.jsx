import CrudTemplate from './CrudTemplate';

export default function Employees() {
  return (
    <CrudTemplate
      title="Employees"
      apiEndpoint="http://localhost:5000/api/employees"
      columns={['empID', 'name', 'role', 'salary', 'hireDate', 'plantID', 'email']}
       idField="empID"
    />
  );
}
