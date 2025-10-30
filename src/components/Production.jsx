import CrudTemplate from './CrudTemplate';

export default function Production() {
  return (
    <CrudTemplate
      title="Production Logs"
      apiEndpoint="http://localhost:5000/api/production"
      columns={['logID', 'plantID', 'logDate', 'energyProduced', 'notes']}
       idField="logID"
    />
  );
}
