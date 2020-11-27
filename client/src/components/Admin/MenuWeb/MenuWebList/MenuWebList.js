import React, {useState, useEffect} from "react";
import { Switch, List,Button,Icon,Modal as ModalAntd,notification} from "antd";
import Modal from "../../../Modal";
import DragSortableList from "react-drag-sortable";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import "./MenuWebList.scss";
import {updateMenuApi,activateMenuApi,deleteMenuApi} from "../../../../api/menu"
import {getAccessTokenApi} from "../../../../api/auth";
import AddMenuWebForm from "../AddMenuWebForm";
import EditMenuWebForm from "../EditMenuWebForm";

const { confirm} = ModalAntd;

export default function MenuWebList(props){
    const {menu, setReloadMenuWeb} = props;
    const [listItems, setListItems] = useState([]);
    const [isVisibleModal, setIsVisibleModal] = useState(false);
    const [modalTitle, setModalTitle] =useState("");
    const [modalContent, setModalContent] = useState(null);

    useEffect(() => {
        const listItemsArray = [];
        menu.forEach(item => {
            listItemsArray.push({
                content: (
                   <MenuItem 
                   item={item} 
                   activateMenu = {activateMenu} 
                   editMenuWebModal={editMenuWebModal}
                   deleteMenu = {deleteMenu}
                   />
                )
            });
        });
        setListItems(listItemsArray);
    },[menu]);

    const activateMenu = ( menu,status) => {
        const accesToken = getAccessTokenApi();
        activateMenuApi(accesToken,menu._id,status).then(response =>{
            notification["success"]({
                message : response
            });
        });
    };

    const  onSort = ( sortedList, dropEvent) => {
        const  accesToken = getAccessTokenApi();

        sortedList.forEach(item =>{
            const {_id} = item.content.props.item;
            const order = item.rank;
            updateMenuApi(accesToken,_id,{order});
        });
    };

    const addMenuWebModal = () =>{
        setIsVisibleModal(true);
        setModalTitle("Creando Menú");
        setModalContent(
            <AddMenuWebForm
            setIsVisibleModal = {setIsVisibleModal}
            setReloadMenuWeb = {setReloadMenuWeb}/>
        );
    };

    const editMenuWebModal = menu => {
        setIsVisibleModal(true);
        setModalTitle(`Editando menu: ${menu.title}`);
        setModalContent(
            <EditMenuWebForm
            setIsVisibleModal = {setIsVisibleModal}
            setReloadMenuWeb = {setReloadMenuWeb}
            menu = {menu}/>
        );
    };

    const  deleteMenu = menu =>{
        const accesToken = getAccessTokenApi();

        confirm({
            title: "Eliminando menu",
            content: `¿Estas seguro de que quieres eliminar el ${menu.title}?`,
            okText: "Eliminar",
            okType: "danger",
            cancelText: "Cancelar",
            onOk(){
              deleteMenuApi(accesToken,menu._id)
              .then(response => {
                notification["success"]({
                  message: response
                });
                setReloadMenuWeb(true);
              })
              .catch(err =>{
                notification["error"]({
                  message: "Error del servidor, intenelo mas tarde."
                });
              });      
            }
          });
    }

     return(
         <div className="menu-web-list">
             <div className="menu-web-list__header">
                 <Button type="primary" onClick={addMenuWebModal}>Crear Menú</Button>
             </div>
             <div className="menu-web-list__items">
                 <DragSortableList items={listItems} onSort={onSort} type="vertical"/>
             </div>
             <Modal 
             title={modalTitle}
             isVisibleModal={isVisibleModal}
             setIsVisibleModal={setIsVisibleModal}
             >
                 {modalContent}
             </Modal>
         </div>

    );
}

function MenuItem(props){
    const {item,activateMenu,editMenuWebModal,deleteMenu} = props;

    return (
        <List.Item
        actions={[
            <Switch defaultChecked={item.active} onChange={e => activateMenu(item,e)}/>,
            <Button type="primary" onClick={() => editMenuWebModal(item)}>
                <EditOutlined />
            </Button>,
            <Button type="danger" onClick={() => deleteMenu(item)}>
                <DeleteOutlined />
            </Button>
        ]}>
            <List.Item.Meta title={item.title} description={item.url} />
        </List.Item>
    )
}