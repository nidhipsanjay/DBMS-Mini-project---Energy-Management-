import CrudTemplate from './CrudTemplate';

export default function Regions() {
  return (
    <CrudTemplate
      title="Regions"
      apiEndpoint="http://localhost:5000/api/regions"
      columns={['regionID', 'regionName', 'avgDemand', 'country', 'currentConsumption']}
       idField="regionID"

    />
  );
}
