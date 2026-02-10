import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Text, FAB, ActivityIndicator, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getClientsByNutritionist } from '../../../services/client.service';
import { Client } from '../../../types/client.types';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ClientsListScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        filterClients();
    }, [searchQuery, clients]);

    const loadClients = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const clientsData = await getClientsByNutritionist(user.id);
            setClients(clientsData);
            setFilteredClients(clientsData);
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterClients = () => {
        if (!searchQuery.trim()) {
            setFilteredClients(clients);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = clients.filter(client =>
            client.personalInfo.name.toLowerCase().includes(query) ||
            client.personalInfo.email.toLowerCase().includes(query) ||
            client.personalInfo.phone.toLowerCase().includes(query)
        );
        setFilteredClients(filtered);
    };

    const calculateAge = (birthDate: Date): number => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const renderClientCard = ({ item }: { item: Client }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(nutritionist)/clients/${item.id}`)}
            activeOpacity={0.7}
        >
            <Card style={styles.clientCard}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <Text style={styles.clientName}>{item.personalInfo.name}</Text>
                        <Chip
                            mode="outlined"
                            compact
                            style={styles.ageChip}
                        >
                            {calculateAge(item.personalInfo.birthDate)} años
                        </Chip>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{item.personalInfo.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Teléfono:</Text>
                        <Text style={styles.infoValue}>{item.personalInfo.phone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Género:</Text>
                        <Text style={styles.infoValue}>
                            {item.personalInfo.gender === 'male' ? 'Masculino' :
                                item.personalInfo.gender === 'female' ? 'Femenino' : 'Otro'}
                        </Text>
                    </View>

                    <Text style={styles.dateText}>
                        Cliente desde {format(item.createdAt, "d 'de' MMMM, yyyy", { locale: es })}
                    </Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando clientes...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Buscar clientes..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />

            {filteredClients.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {searchQuery ? 'No se encontraron clientes' : 'No tienes clientes aún'}
                    </Text>
                    {!searchQuery && (
                        <Text style={styles.emptySubtext}>
                            Presiona el botón + para agregar tu primer cliente
                        </Text>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredClients}
                    renderItem={renderClientCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => router.push('/(nutritionist)/clients/add')}
                label="Agregar Cliente"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        marginTop: Spacing.md,
        color: Colors.textSecondary,
    },
    searchBar: {
        margin: Spacing.md,
        elevation: 2,
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: 100,
    },
    clientCard: {
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.lg,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    clientName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
    },
    ageChip: {
        marginLeft: Spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: Spacing.xs,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        width: 80,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.text,
        flex: 1,
    },
    dateText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    fab: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.lg,
        backgroundColor: Colors.primary,
    },
});
