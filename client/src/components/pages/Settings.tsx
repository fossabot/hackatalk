import {Button, useTheme} from 'dooboo-ui';
import React, {ReactElement} from 'react';
import {SectionList, SectionListData} from 'react-native';
import {SvgApple, SvgFacebook, SvgGoogle} from '../../utils/Icons';
import {graphql, useMutation} from 'react-relay/hooks';
import styled, {DefaultTheme} from 'styled-components/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthType} from '../../types/graphql';
import {FontAwesome} from '@expo/vector-icons';
import {MainStackNavigationProps} from '../navigations/MainStackNavigator';
import type {SettingsDeleteNotificationMutation} from '../../__generated__/SettingsDeleteNotificationMutation.graphql';
import {getString} from '../../../STRINGS';
import {useAuthContext} from '../../providers/AuthProvider';

const Container = styled.SafeAreaView`
  flex: 1;
  padding-top: 10px;
  background-color: ${({theme}) => theme.background};
`;

const HeaderContainer = styled.View`
  background-color: ${({theme}) => theme.background};
  border-bottom-color: ${({theme}) => theme.lineColor};
  height: 40px;
  justify-content: center;
  margin-left: 12px;
  border-bottom-width: 1px;
`;

const SectionHeader = styled.Text`
  color: ${({theme}) => theme.secondaryText};
  margin-left: 2px;
`;

const ItemContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding-left: 15px;
  padding-right: 15px;
  width: 100%;
  height: 52px;
  align-items: center;
`;

const ItemLabel = styled.Text`
  color: ${({theme}) => theme.text};
  font-size: 16px;
  flex: 1;
`;

export interface Props {
  navigation: MainStackNavigationProps<'Settings'>;
}

const deleteNotification = graphql`
  mutation SettingsDeleteNotificationMutation($token: String!) {
    deleteNotification(token: $token) {
      id
      token
      device
      createdAt
    }
  }
`;

interface SettingsOption {
  label: string;
  icon?: ReactElement;
  onPress(): void;
  testID: string;
}

function Settings(props: Props): React.ReactElement {
  let signInInfoOption: SettingsOption;

  const {setUser} = useAuthContext();
  const {theme} = useTheme();
  const {navigation} = props;

  const {
    state: {user},
  } = useAuthContext();

  const [commitNotification] = useMutation<SettingsDeleteNotificationMutation>(
    deleteNotification,
  );

  const renderSectionItem = (
    option: SettingsOption,
    themeProps: DefaultTheme,
  ): React.ReactElement => {
    const isEmailUser =
      (user?.profile?.authType || AuthType.Email) === AuthType.Email;

    return (
      <ItemContainer
        onPress={isEmailUser ? option.onPress : undefined}
        testID={option.testID}>
        {option.icon || null}
        <ItemLabel style={{marginLeft: 8, marginTop: 2}}>
          {option.label}
        </ItemLabel>
        {isEmailUser ? (
          <FontAwesome name="angle-right" size={24} color={themeProps.text} />
        ) : null}
      </ItemContainer>
    );
  };

  const logout = async (): Promise<void> => {
    if (navigation) {
      AsyncStorage.removeItem('token');

      const pushToken = await AsyncStorage.getItem('push_token');

      if (pushToken) {
        const deleteNotificationMutationConfig = {
          variables: {
            token: pushToken,
          },
        };

        commitNotification(deleteNotificationMutationConfig);
      }

      setUser(undefined);
    }
  };

  switch (user?.profile?.authType) {
    case AuthType.Google:
      signInInfoOption = {
        icon: <SvgGoogle width={24} fill={theme.text} />,
        label: getString('SIGNED_IN_WITH_GOOGLE'),
        onPress: (): void => {
          navigation.navigate('ChangePw');
        },
        testID: 'change-pw-item',
      };

      break;
    case AuthType.Facebook:
      signInInfoOption = {
        icon: <SvgFacebook width={24} fill={theme.text} />,
        label: getString('SIGNED_IN_WITH_FACEBOOK'),
        onPress: (): void => {
          navigation.navigate('ChangePw');
        },
        testID: 'change-pw-item',
      };

      break;
    case AuthType.Apple:
      signInInfoOption = {
        icon: <SvgApple width={24} fill={theme.text} />,
        label: getString('SIGNED_IN_WITH_APPLE'),
        onPress: (): void => {
          navigation.navigate('ChangePw');
        },
        testID: 'change-pw-item',
      };

      break;
    case AuthType.Email:
    default:
      signInInfoOption = {
        label: getString('SIGNED_IN_WITH_EMAIL'),
        onPress: (): void => {
          navigation.navigate('ChangePw');
        },
        testID: 'change-pw-item',
      };

      break;
  }

  const settings: SectionListData<SettingsOption>[] = [
    {
      title: getString('LOGIN_INFORMATION'),
      data: [signInInfoOption],
    },
  ];

  return (
    <Container>
      <SectionList
        testID="test-section-list"
        sections={settings}
        renderItem={({item}): React.ReactElement =>
          renderSectionItem(item, theme)
        }
        keyExtractor={(item: SettingsOption): string => item.label}
        renderSectionHeader={({section: {title}}): React.ReactElement => (
          <HeaderContainer>
            <SectionHeader>{title}</SectionHeader>
          </HeaderContainer>
        )}
      />
      <Button
        testID="button-logout"
        style={{
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
        styles={{
          container: {
            width: '100%',
            height: 48,
            backgroundColor: theme.btnPrimaryLight,
            borderColor: theme.btnPrimary,
            borderWidth: 0.3,
          },
          text: {
            color: theme.btnPrimary,
            fontSize: 14,
            fontWeight: 'bold',
          },
        }}
        onPress={logout}
        text={getString('LOGOUT')}
      />
    </Container>
  );
}

export default Settings;