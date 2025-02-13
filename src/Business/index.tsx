import { Table, Spin } from "antd";
import { useGetAllBusinessesQuery } from "./features/businessSlice";

const BusinessList = () => {
  const { data, isLoading } = useGetAllBusinessesQuery({});
  const businesses = data?.customerBusinesses;
  //   const [deleteBusiness] = useDeleteBusinessMutation();
  //   const [editBusiness] = useState(null);
  //   const [ setIsModalOpen] = useState(false);

  //   const handleDelete = async (id) => {
  //     try {
  //       await deleteBusiness(id).unwrap();
  //       message.success("Business deleted successfully!");
  //     } catch (error) {
  //       message.error("Failed to delete business.");
  //     }
  //   };

  if (isLoading) return <Spin />;

  return (
    <>
      {/* <Button
        type="primary"
        className="mb-4"
        onClick={() => setIsModalOpen(true)}
      >
        Add Business
      </Button> */}

      <Table dataSource={businesses} rowKey="id" bordered>
        <Table.Column title="Business Name" dataIndex="name" />
        <Table.Column title="Type" dataIndex="business_type" />
        <Table.Column title="Sector" dataIndex="sector" />
        <Table.Column title="Monthly Revenue" dataIndex="monthly_revenue" />
        {/* <Table.Column
          title="Actions"
          render={(business) => (
            <div className="flex gap-2">
              <Button type="link" onClick={() => { setEditBusiness(business); setIsModalOpen(true); }}>
                Edit
              </Button>
              <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(business.id)}>
                <Button type="link" danger>Delete</Button>
              </Popconfirm>
            </div>
          )}
        /> */}
      </Table>

      {/* <BusinessForm
        visible={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditBusiness(null); }}
        business={editBusiness}
      /> */}
    </>
  );
};

export default BusinessList;
