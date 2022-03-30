import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import todoFaker from 'fake-todos';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';

function getUuid() {
    let d = new Date().getTime();
    const uuidFormat = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return uuidFormat.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
    });
}

const DEFAULT_ITEMS = todoFaker(500);

const Item = memo(({what, onRemove, onSelect, onUnSelect}) => {
    const inputRef = useRef()
    const [inputValue, setInputValue] = useState(what)
    const [isEditing, setIsEditing] = useState(false)
    const [isSelected, setIsSelected] = useState(false)

    const isEmptyInput = useMemo(() => {
        return inputValue === '' || !inputValue
    }, [inputValue])

    const onPressIn = useCallback(() => {
        setIsEditing(true)
    }, [])

    const onEndEditing = useCallback(() => {
        setIsEditing(false)
    }, [onRemove])

    const onKeyPress = useCallback((e) => {
        const keyValue = e.nativeEvent.key
        if (keyValue === 'Backspace' && !isSelected && isEmptyInput) onRemove()
        if (keyValue === 'Backspace' && isSelected) onRemove()
    }, [inputValue, isEmptyInput, onRemove])

    const onChangeText = useCallback((text) => {
        setInputValue(text)
    }, [])

    const onSelectItem = useCallback(() => {
        if (isSelected) {
            setIsSelected(false)
            onUnSelect()
        } else {
            setIsSelected(true)
            onSelect()
        }
    }, [isSelected, inputValue, onSelect, onUnSelect])

    return (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={isEmptyInput ? undefined : onSelectItem}
                disabled={isEmptyInput}
                style={[
                    styles.itemSquare,
                    isSelected && styles.itemSquareChecked,
                    isEmptyInput && styles.itemSquareDisabled,
                ]}
            />
            <TextInput
                ref={(ref) => inputRef.current = ref}
                onPressIn={onPressIn}
                onKeyPress={onKeyPress}
                onChangeText={onChangeText}
                onEndEditing={onEndEditing}
                editable={isEditing}
                style={[styles.text, isSelected && styles.textSelected]}
                value={inputValue}
                placeholder={'New Item'}
                multiline
                scrollEnabled={false}
            />
        </View>
    )
})

const ItemContainer = () => {
    const insets = useSafeAreaInsets();
    const [actionContainerHeight, setActionContainerHeight] = useState(0);
    const [isKeyboardShown, setIsKeyboardShown] = useState(false);
    const [items, setItems] = useState(DEFAULT_ITEMS);
    const [selectedItems, setSelectedItems] = useState([]);

    const onActionLayout = useCallback((e) => {
        const {layout: {height}} = e.nativeEvent
        setActionContainerHeight(height)
    }, [])

    const onRemoveItem = useCallback((id) => {
        setItems(currentItems => {
            const newItems = [...currentItems]
            const removedIndex = newItems.findIndex((item) => item.id === id)
            newItems.splice(removedIndex, 1)
            return newItems
        })
    }, [])

    const onRemoveSelectedItems = useCallback(() => {
        setItems(currentItems => {
            return currentItems.filter(item => !selectedItems.includes(item.id))
        })
        setSelectedItems([])
    }, [selectedItems])

    const onSelectItem = useCallback((id) => {
        setSelectedItems(currentSelectedItems => {
            const newSelectedItems = [...currentSelectedItems]
            newSelectedItems.push(id)
            return newSelectedItems
        })
    }, [])

    const onUnSelectItem = useCallback((id) => {
        setSelectedItems(currentSelectedItems => {
            const newSelectedItems = [...currentSelectedItems]
            const removedIndex = newSelectedItems.indexOf(id)
            newSelectedItems.splice(removedIndex, 1)
            return newSelectedItems
        })
    }, [])

    const onAddItem = useCallback(() => {
        setItems(currentItems => {
            const newItems = [...currentItems]
            newItems.push({
                id: getUuid(),
                what: '',
            })
            return newItems
        })
    }, [])

    const renderItem = useCallback(({item}) => {
        const onRemove = () => {
            onRemoveItem(item.id)
            onUnSelectItem(item.id)
        }
        const onSelect = () => onSelectItem(item.id)
        const onUnSelect = () => onUnSelectItem(item.id)
        return (
            <Item
                onSelect={onSelect}
                onUnSelect={onUnSelect}
                onRemove={onRemove}
                {...item}/>
        )
    }, [onRemoveItem, onSelectItem])

    const keyExtractor = useCallback((item) => item.id, [])

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            setIsKeyboardShown(true)
        });
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setIsKeyboardShown(false)
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <FlatList
                contentContainerStyle={[
                    styles.contentContainer, {
                    paddingTop: insets.top,
                    paddingBottom: isKeyboardShown ? 0 : actionContainerHeight + 15
                }]}
                data={items}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={ItemSeparator}
            />
            <View onLayout={onActionLayout} style={[styles.infoContainer, {paddingBottom: insets.bottom}]}>
                <TouchableOpacity
                    onPress={onRemoveSelectedItems}
                    disabled={selectedItems.length <= 0}
                    style={[
                        styles.buttonContainer,
                        {backgroundColor: '#d50000'},
                        selectedItems.length <= 0 && styles.buttonContainerDisabled
                    ]}>
                    <Text style={styles.buttonText}>Delete ({selectedItems.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onAddItem}
                    style={[styles.buttonContainer]}>
                    <Text style={styles.buttonText}>Add New</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

const ItemSeparator = () => <View style={styles.itemSeparator}/>

export default function App() {
    return (
        <SafeAreaProvider>
            <ItemContainer/>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {},
    itemContainer: {
        paddingVertical: 5,
        paddingHorizontal: 30,
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E1E5E8'
    },
    itemSquare: {
        alignSelf: 'flex-start',
        marginTop: 5,
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#C2C2C2',
        marginRight: 10,
    },
    itemSquareChecked: {
        borderColor: '#06bcee',
        backgroundColor: '#06bcee'
    },
    itemSquareDisabled: {
      borderStyle: 'dashed'
    },
    text: {
        flex: 1,
        paddingBottom: 5,
        paddingTop: 5,
        fontSize: 16,
        alignSelf: 'center'
    },
    textSelected: {
        textDecorationLine: 'line-through'
    },
    infoContainer: {
        bottom: 0,
        position: "absolute",
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 20,
        backgroundColor: '#fafafa',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    buttonContainer: {
        flex: 1,
        marginHorizontal: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#0091ea',
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonContainerDisabled: {
        backgroundColor: '#bdbdbd',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
});
