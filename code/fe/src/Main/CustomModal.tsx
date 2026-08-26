
import { MutableRefObject, ReactNode, forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { useTheme } from '../../theme';
import { useCommonStyle } from '../Common/Styles';
const CustomModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const modalRef = useRef<CustomModalRef>();
  const [content, setContent] = useState<ReactNode>();
  const colors = useTheme();
  const style = useCommonStyle();
  useImperativeHandle(
    modalRef,
    () => ({
      show: (content?: ReactNode) => {
        if (content) {
          setContent(a => content);
          setModalVisible(v => true);
        } else {
          setModalVisible(true);
        }

      },
      hide: () => {
        setModalVisible(false);
      },
    }),
    []
  );
  useLayoutEffect(() => {
    ModalController.setModalRef(modalRef);
  }, []);
  return <Modal visible={modalVisible} >
    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
      <View style={style.modal.modalOverlay} />
    </TouchableWithoutFeedback>
    <View style={[style.modal.modalContent]}>
      {content}
    </View>
  </Modal>;
};

export default forwardRef(CustomModal);


export type CustomModalRef = {
  show: (content?: ReactNode) => void
  hide: () => void
}

export class ModalController {
  static modalRef: MutableRefObject<CustomModalRef>;
  static setModalRef = (ref: any) => {
    this.modalRef = ref;
  };

  static showModal = (content?: ReactNode) => {

    this.modalRef.current?.show();
  };

  static hideModal = () => {
    this.modalRef.current?.hide();
  };
}