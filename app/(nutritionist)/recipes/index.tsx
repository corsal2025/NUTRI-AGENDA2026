import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, FAB, ActivityIndicator, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';

interface Recipe {
    id: string;
    name: string;
    description: string;
    ingredients: string[];
    instructions: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servings: number;
    prepTime: number;
    category: string;
}

const CATEGORIES = ['Desayuno', 'Almuerzo', 'Cena', 'Snack', 'Bebida', 'Postre'];

export default function RecipesScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [servings, setServings] = useState('1');
    const [prepTime, setPrepTime] = useState('');
    const [category, setCategory] = useState('Almuerzo');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRecipes();
    }, []);

    const loadRecipes = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'recipes'),
                where('nutritionistId', '==', user.id)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
            })) as Recipe[];
            setRecipes(data);
        } catch (error) {
            console.error('Error loading recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name || !ingredients || !user) {
            Alert.alert('Error', 'Por favor ingresa nombre e ingredientes');
            return;
        }

        setSaving(true);
        try {
            await addDoc(collection(db, 'recipes'), {
                nutritionistId: user.id,
                name,
                description,
                ingredients: ingredients.split('\n').filter(i => i.trim()),
                instructions,
                calories: parseInt(calories) || 0,
                protein: parseInt(protein) || 0,
                carbs: parseInt(carbs) || 0,
                fat: parseInt(fat) || 0,
                servings: parseInt(servings) || 1,
                prepTime: parseInt(prepTime) || 0,
                category,
                createdAt: Timestamp.now(),
            });

            resetForm();
            loadRecipes();
            Alert.alert('Guardado', 'Receta creada correctamente');
        } catch (error) {
            console.error('Error saving recipe:', error);
            Alert.alert('Error', 'No se pudo guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Eliminar', '¿Estás seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar', style: 'destructive', onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'recipes', id));
                        loadRecipes();
                    } catch (error) {
                        Alert.alert('Error', 'No se pudo eliminar');
                    }
                }
            },
        ]);
    };

    const resetForm = () => {
        setShowForm(false);
        setName('');
        setDescription('');
        setIngredients('');
        setInstructions('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');
        setServings('1');
        setPrepTime('');
        setCategory('Almuerzo');
    };

    const filteredRecipes = filter
        ? recipes.filter(r => r.category === filter)
        : recipes;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.wrapper}>
                    <Text style={styles.title}>🍳 Recetas</Text>

                    {/* Category filters */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
                        <Chip
                            selected={!filter}
                            onPress={() => setFilter('')}
                            style={styles.filterChip}
                        >
                            Todas
                        </Chip>
                        {CATEGORIES.map(cat => (
                            <Chip
                                key={cat}
                                selected={filter === cat}
                                onPress={() => setFilter(filter === cat ? '' : cat)}
                                style={styles.filterChip}
                            >
                                {cat}
                            </Chip>
                        ))}
                    </ScrollView>

                    {filteredRecipes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🍽️</Text>
                            <Text style={styles.emptyTitle}>Sin recetas</Text>
                            <Text style={styles.emptyText}>Crea tu primera receta saludable</Text>
                        </View>
                    ) : (
                        filteredRecipes.map((recipe) => (
                            <View key={recipe.id} style={styles.recipeCard}>
                                <View style={styles.recipeHeader}>
                                    <View>
                                        <Text style={styles.recipeName}>{recipe.name}</Text>
                                        <Chip compact style={styles.categoryChip}>{recipe.category}</Chip>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(recipe.id)}>
                                        <Text style={styles.deleteBtn}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>
                                {recipe.description && (
                                    <Text style={styles.recipeDesc}>{recipe.description}</Text>
                                )}
                                <View style={styles.macrosRow}>
                                    <Text style={styles.macroItem}>🔥 {recipe.calories} kcal</Text>
                                    <Text style={styles.macroItem}>🥩 {recipe.protein}g</Text>
                                    <Text style={styles.macroItem}>🍞 {recipe.carbs}g</Text>
                                    <Text style={styles.macroItem}>🥑 {recipe.fat}g</Text>
                                </View>
                                <View style={styles.metaRow}>
                                    <Text style={styles.metaItem}>⏱️ {recipe.prepTime} min</Text>
                                    <Text style={styles.metaItem}>🍽️ {recipe.servings} porción(es)</Text>
                                </View>
                                <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
                                {recipe.ingredients.map((ing, idx) => (
                                    <Text key={idx} style={styles.ingredientItem}>• {ing}</Text>
                                ))}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Form Modal */}
            {showForm && (
                <View style={styles.modalOverlay}>
                    <ScrollView style={styles.modalScroll}>
                        <View style={styles.modal}>
                            <Text style={styles.modalTitle}>Nueva receta</Text>

                            <TextInput mode="outlined" label="Nombre*" value={name} onChangeText={setName} style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            <TextInput mode="outlined" label="Descripción" value={description} onChangeText={setDescription} style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />

                            <Text style={styles.inputLabel}>Categoría</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
                                {CATEGORIES.map(cat => (
                                    <Chip
                                        key={cat}
                                        selected={category === cat}
                                        onPress={() => setCategory(cat)}
                                        style={styles.filterChip}
                                    >
                                        {cat}
                                    </Chip>
                                ))}
                            </ScrollView>

                            <View style={styles.row}>
                                <TextInput mode="outlined" label="Calorías" value={calories} onChangeText={setCalories} keyboardType="numeric" style={[styles.input, styles.inputQuarter]} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                                <TextInput mode="outlined" label="Proteína (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" style={[styles.input, styles.inputQuarter]} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                                <TextInput mode="outlined" label="Carbos (g)" value={carbs} onChangeText={setCarbs} keyboardType="numeric" style={[styles.input, styles.inputQuarter]} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                                <TextInput mode="outlined" label="Grasa (g)" value={fat} onChangeText={setFat} keyboardType="numeric" style={[styles.input, styles.inputQuarter]} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            </View>

                            <View style={styles.row}>
                                <TextInput mode="outlined" label="Porciones" value={servings} onChangeText={setServings} keyboardType="numeric" style={[styles.input, styles.inputHalf]} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                                <TextInput mode="outlined" label="Tiempo (min)" value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" style={[styles.input, styles.inputHalf]} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            </View>

                            <TextInput mode="outlined" label="Ingredientes* (uno por línea)" value={ingredients} onChangeText={setIngredients} multiline numberOfLines={5} style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />
                            <TextInput mode="outlined" label="Instrucciones" value={instructions} onChangeText={setInstructions} multiline numberOfLines={5} style={styles.input} outlineColor={Colors.inputBorder} activeOutlineColor={Colors.primary} textColor={Colors.inputText} />

                            <View style={styles.modalActions}>
                                <Button mode="text" onPress={resetForm}>Cancelar</Button>
                                <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} buttonColor={Colors.primary}>
                                    Guardar
                                </Button>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            )}

            <FAB icon="plus" style={styles.fab} onPress={() => setShowForm(true)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    scroll: { flex: 1 },
    scrollContent: { paddingVertical: Spacing.md, paddingBottom: 100 },
    wrapper: { paddingHorizontal: Spacing.md, maxWidth: 500, alignSelf: 'center', width: '100%' },
    title: { fontSize: FontSizes.xxl, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.sm },
    filtersRow: { marginBottom: Spacing.md },
    filterChip: { marginRight: Spacing.xs },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
    emptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: Colors.text },
    emptyText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
    recipeCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
    recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xs },
    recipeName: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.text },
    categoryChip: { marginTop: 4 },
    recipeDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
    macrosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs },
    macroItem: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: FontWeights.medium },
    metaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
    metaItem: { fontSize: FontSizes.xs, color: Colors.textMuted },
    ingredientsTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.text, marginTop: Spacing.sm },
    ingredientItem: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginLeft: Spacing.xs },
    deleteBtn: { fontSize: 18 },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalScroll: { flex: 1 },
    modal: { backgroundColor: Colors.surface, margin: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.lg },
    modalTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.text, marginBottom: Spacing.md },
    input: { backgroundColor: Colors.surface, marginBottom: Spacing.sm },
    inputLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
    categoryRow: { marginBottom: Spacing.md },
    row: { flexDirection: 'row', gap: Spacing.xs },
    inputHalf: { flex: 1 },
    inputQuarter: { flex: 1 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, marginTop: Spacing.md },
    fab: { position: 'absolute', right: Spacing.lg, bottom: Spacing.lg, backgroundColor: Colors.primary },
});
